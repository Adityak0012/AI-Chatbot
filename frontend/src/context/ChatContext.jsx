import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  const [errorType, setErrorType] = useState('');

  const setErrorWithType = useCallback((message, type = 'general') => {
    setError(message);
    setErrorType(type);
  }, []);

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

  const handleLogout = useCallback((reason = '') => {
    localStorage.removeItem('access_token');
    setUserProfile(null);
    setSessions([]);
    setProjects([]);
    setMessages([]);
    setCurrentSessionId(null);
    navigate('/login', { state: { reason } });
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
        localStorage.removeItem('access_token');
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

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

  const initialFetchDone = useRef(false);

  useEffect(() => {
    if (initialFetchDone.current) return;
    const token = localStorage.getItem('access_token');
    if (token) {
      initialFetchDone.current = true;
      fetchInitialData();
    }
  }, []);

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

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setCurrentSessionId(null);
    setError('');
  }, []);

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

    const userMsg = { role: 'user', content: displayContent, _attachmentFiles: attachments ? [...attachments] : [] };
    setMessages(prev => [...prev, userMsg]);
    setIsSending(true);

    try {
      const formData = new FormData();
      formData.append('prompt', content.trim() || ' ');
      formData.append('effort', effort);
      formData.append('stream', '1');
      if (model) formData.append('model', model);
      if (currentSessionId) formData.append('session_id', currentSessionId);
      if (projectId) formData.append('project_id', projectId);
      if (skill) formData.append('skill', skill);
      formData.append('web_search', webSearch ? '1' : '0');
      if (attachments && attachments.length > 0) {
        attachments.forEach(file => formData.append('files', file));
      }

      const token = localStorage.getItem('access_token');
      const baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
      const response = await fetch(`${baseURL}/chat`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) { handleLogout('session_expired'); return; }
        const errData = await response.json().catch(() => ({}));
        const detail = errData.detail;
        const errMsg = Array.isArray(detail)
          ? (detail[0]?.msg || 'Failed to get a response.')
          : (typeof detail === 'string' ? detail : 'Failed to get a response.');
        if (response.status === 429) {
          setErrorWithType(errMsg, 'rate_limit');
        } else if (response.status === 504) {
          setErrorWithType(errMsg, 'timeout');
        } else if (response.status === 503) {
          setErrorWithType(errMsg, 'unavailable');
        } else {
          setErrorWithType(errMsg, 'general');
        }
        setMessages(prev => prev.slice(0, -1));
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedContent = '';
      let newSessionId = currentSessionId;
      let buffer = '';
      let animFrameId = null;
      let pendingContent = '';

      setMessages(prev => [...prev, { role: 'ai', content: '' }]);

      const flushUpdate = () => {
        const snap = pendingContent;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'ai', content: snap, isStreaming: true };
          return updated;
        });
        animFrameId = null;
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) {
                newSessionId = data.session_id;
                if (data.title) {
                  setSessions(prev =>
                    prev.map(s => s.id === data.session_id ? { ...s, title: data.title } : s)
                  );
                }
              } else if (data.error) {
                setErrorWithType(data.error, 'stream');
              } else if (data.content) {
                streamedContent += data.content;
                pendingContent = streamedContent;
              }
            } catch {}
          }
        }

        if (!animFrameId) {
          animFrameId = requestAnimationFrame(flushUpdate);
        }
      }

      if (animFrameId) cancelAnimationFrame(animFrameId);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'ai', content: streamedContent, isStreaming: false };
        return updated;
      });

      if (soundEnabled) playNotificationSound();
      if (desktopNotifEnabled) showDesktopNotification('New response', streamedContent.slice(0, 100));
      if (responseAlertsEnabled) flashTabTitle('💬 New reply');

      if (!currentSessionId && newSessionId) {
        setCurrentSessionId(newSessionId);
        const historyRes = await api.get('/chat/history');
        setSessions(historyRes.data);
        // Replace blob URLs with server URLs in user message
        const sessionRes = await api.get(`/chat/history/${newSessionId}`);
        if (sessionRes.data.messages?.length > 0) {
          const lastUserMsg = sessionRes.data.messages.find(m => m.role === 'user');
          if (lastUserMsg) {
            setMessages(prev => {
              const updated = [...prev];
              const userMsgIdx = updated.findIndex(m => m.role === 'user' && m.content.includes('blob:'));
              if (userMsgIdx !== -1) updated[userMsgIdx] = { role: 'user', content: lastUserMsg.content };
              return updated;
            });
          }
        }
      } else {
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
      if (err?.message?.includes('401') || err?.status === 401) {
        handleLogout();
        return;
      }
      if (err?.message?.includes('fetch') || err?.message?.includes('network')) {
        setErrorWithType('Network error. Please check your internet connection.', 'network');
      } else {
        setErrorWithType('Failed to get a response. Please try again.', 'general');
      }
      setMessages(prev => prev.slice(0, -1));
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
    errorType,
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
