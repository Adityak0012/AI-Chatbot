import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { playNotificationSound, showDesktopNotification, flashTabTitle } from '../utils/notify';
import { useSettings } from './SettingsContext';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const navigate = useNavigate();
  const { soundEnabled, desktopNotifEnabled, responseAlertsEnabled } = useSettings();
  
  const [sessions, setSessions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [libraryFiles, setLibraryFiles] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const [savedMessages, setSavedMessages] = useState([]);

  const fetchProjects = useCallback(async () => {
    const res = await api.get('/projects');
    setProjects(res.data);
    return res.data;
  }, []);

  const assignSessionToProject = useCallback(async (sessionId, projectId) => {
    await api.patch(`/chat/${sessionId}/project`, { project_id: projectId });
  }, []);

  const fetchSavedMessages = useCallback(async () => {
    const res = await api.get('/chat/saved');
    setSavedMessages(res.data);
    return res.data;
  }, []);

  const saveMessage = useCallback(async (messageId) => {
    await api.post(`/chat/message/${messageId}/save`);
    await fetchSavedMessages();
  }, [fetchSavedMessages]);

  const unsaveMessage = useCallback(async (messageId) => {
    await api.post(`/chat/message/${messageId}/unsave`);
    await fetchSavedMessages();
  }, [fetchSavedMessages]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token');
    setUserProfile(null);
    setSessions([]);
    setProjects([]);
    setMessages([]);
    setCurrentSessionId(null);
    navigate('/login');
  }, [navigate]);

  const fetchInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [userRes, historyRes, projectsRes, libraryRes] = await Promise.all([
        api.get('/users/me'),
        api.get('/chat/history'),
        api.get('/projects'),
        api.get('/library')
      ]);
      setUserProfile(userRes.data);
      setSessions(historyRes.data);
      setProjects(projectsRes.data);
      setLibraryFiles(libraryRes.data);
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [handleLogout]);

  const updateUserProfile = useCallback(async (updates) => {
    const res = await api.patch('/users/me', updates);
    setUserProfile(res.data);
    return res.data;
  }, []);

  const uploadAvatar = useCallback(async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setUserProfile(res.data);
    return res.data;
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchInitialData();
    }
  }, [fetchInitialData]);

  const loadSession = async (sessionId) => {
    try {
      setIsLoading(true);
      const res = await api.get(`/chat/history/${sessionId}`);
      setCurrentSessionId(sessionId);
      setMessages(res.data.messages);
      setError('');
    } catch (err) {
      console.error('Failed to load session:', err);
      setError('Failed to load chat history.');
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async (projectData) => {
    try {
      const res = await api.post('/projects', projectData);
      setProjects(prev => [res.data, ...prev]);
      return res.data;
    } catch (err) {
      console.error('Failed to create project:', err);
      throw err;
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await api.delete(`/projects/${projectId}`);
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (err) {
      console.error('Failed to delete project:', err);
      setError('Failed to delete project.');
    }
  };

  const renameProject = async (projectId, newName) => {
    try {
      const res = await api.patch(`/projects/${projectId}`, { name: newName });
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, name: res.data.name, updated_at: res.data.updated_at } : p));
    } catch (err) {
      console.error('Failed to rename project:', err);
      setError('Failed to rename project.');
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      await api.delete(`/chat/${sessionId}`);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
      setError('Failed to delete chat.');
    }
  };

  const renameSession = async (sessionId, newTitle) => {
    try {
      const res = await api.patch(`/chat/${sessionId}`, { title: newTitle });
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title: res.data.title, updated_at: res.data.updated_at } : s));
    } catch (err) {
      console.error('Failed to rename session:', err);
      setError('Failed to rename chat.');
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setError('');
  };

  const sendMessage = async (content, attachments = [], effort = 'medium', model = null, projectId = null, skill = null, webSearch = false) => {
    if ((!content.trim() && attachments.length === 0) || isSending) return;

    setError('');
    
    let displayContent = content.trim();
    if (attachments && attachments.length > 0) {
      const imageLinks = [];
      const fileLinks = [];
      attachments.forEach(file => {
        if (file.type && file.type.startsWith('image/')) {
          const localUrl = URL.createObjectURL(file);
          imageLinks.push(`![Attached Image](${localUrl})`);
        } else {
          fileLinks.push(`[📄 ${file.name}](#)`);
        }
      });
      
      const allLinks = [...imageLinks, ...fileLinks].join('\n\n');
      if (allLinks) {
        displayContent = displayContent ? `${allLinks}\n\n${displayContent}` : allLinks;
      }
    }

    const userMsg = { role: 'user', content: displayContent };
    setMessages(prev => [...prev, userMsg]);
    setIsSending(true);

    try {
      const formData = new FormData();
      formData.append('prompt', content.trim());
      formData.append('effort', effort);
      if (model) {
        formData.append('model', model);
      }
      if (currentSessionId) {
        formData.append('session_id', currentSessionId);
      }
      if (projectId) {
        formData.append('project_id', projectId);
      }
      if (skill) {
        formData.append('skill', skill);
      }
      formData.append('web_search', webSearch);
      
      if (attachments && attachments.length > 0) {
        attachments.forEach(file => {
          formData.append('files', file);
        });
      }
      
      const response = await api.post('/chat', formData);
      
      const newSessionId = response.data.session_id;
      
      let finalContent = response.data.response;
      if (Array.isArray(finalContent)) {
        finalContent = finalContent.join('\n');
      } else if (typeof finalContent === 'object' && finalContent !== null) {
        finalContent = finalContent.content || finalContent.message || String(finalContent);
      }
      finalContent = String(finalContent || '');
      
      setMessages(prev => [...prev, { role: 'ai', content: finalContent }]);

      if (soundEnabled) playNotificationSound();
      if (desktopNotifEnabled) showDesktopNotification('New response', finalContent.slice(0, 100));
      if (responseAlertsEnabled) flashTabTitle('💬 New reply');
      
      if (!currentSessionId && newSessionId) {
        setCurrentSessionId(newSessionId);
        // Refresh session list to show new chat
        const historyRes = await api.get('/chat/history');
        setSessions(historyRes.data);
      } else {
        // Update the timestamp of current session to bring it to top
        setSessions(prev => {
          const updated = [...prev];
          const idx = updated.findIndex(s => s.id === (currentSessionId || newSessionId));
          if (idx !== -1) {
            const [session] = updated.splice(idx, 1);
            session.updated_at = new Date().toISOString();
            updated.unshift(session);
          }
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        const backendError = err.response?.data?.detail || 'Failed to get a response. Please try again.';
        setError(backendError);
      }
    } finally {
      setIsSending(false);
    }
  };

  const regenerateResponse = async (index) => {
    if (isSending) return;
    
    let userMsgIndex = -1;
    for (let i = index - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        userMsgIndex = i;
        break;
      }
    }
    
    if (userMsgIndex === -1) return;
    
    const content = messages[userMsgIndex].content;
    
    setMessages(prev => prev.slice(0, userMsgIndex + 1));
    setIsSending(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('prompt', content);
      if (currentSessionId) {
        formData.append('session_id', currentSessionId);
      }
      
      const response = await api.post('/chat', formData);
      
      let finalContent = response.data.response;
      if (Array.isArray(finalContent)) {
        finalContent = finalContent.join('\n');
      } else if (typeof finalContent === 'object' && finalContent !== null) {
        finalContent = finalContent.content || finalContent.message || String(finalContent);
      }
      finalContent = String(finalContent || '');
      
      setMessages(prev => [...prev, { role: 'ai', content: finalContent }]);

      if (soundEnabled) playNotificationSound();
      if (desktopNotifEnabled) showDesktopNotification('New response', finalContent.slice(0, 100));
      if (responseAlertsEnabled) flashTabTitle('💬 New reply');
      
      if (currentSessionId) {
        setSessions(prev => {
          const updated = [...prev];
          const idx = updated.findIndex(s => s.id === currentSessionId);
          if (idx !== -1) {
            const [session] = updated.splice(idx, 1);
            session.updated_at = new Date().toISOString();
            updated.unshift(session);
          }
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        const backendError = err.response?.data?.detail || 'Failed to get a response. Please try again.';
        setError(backendError);
      }
    } finally {
      setIsSending(false);
    }
  };

  const uploadLibraryFiles = async (fileList) => {
    try {
      const formData = new FormData();
      fileList.forEach(file => formData.append('files', file));
      const res = await api.post('/library/upload', formData);
      setLibraryFiles(prev => [...res.data, ...prev]);
    } catch (err) {
      console.error('Failed to upload files:', err);
      setError('Failed to upload files.');
    }
  };

  const deleteLibraryFile = async (fileId) => {
    try {
      await api.delete(`/library/${fileId}`);
      setLibraryFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (err) {
      console.error('Failed to delete file:', err);
      setError('Failed to delete file.');
    }
  };

  const value = {
    sessions,
    projects,
    fetchProjects,
    assignSessionToProject,
    libraryFiles,
    currentSessionId,
    messages,
    userProfile,
    updateUserProfile,
    uploadAvatar,
    isLoading,
    isSending,
    error,
    loadSession,
    deleteSession,
    renameSession,
    handleNewChat,
    sendMessage,
    regenerateResponse,
    createProject,
    deleteProject,
    renameProject,
    uploadLibraryFiles,
    deleteLibraryFile,
    handleLogout,
    savedMessages,
    fetchSavedMessages,
    saveMessage,
    unsaveMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
