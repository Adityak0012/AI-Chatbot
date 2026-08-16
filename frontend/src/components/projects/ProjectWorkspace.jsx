import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Folder, Send, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { useChat } from '../../context/ChatContext';

export const ProjectWorkspace = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, sessions, sendMessage, loadSession } = useChat();
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const project = projects.find(p => p.id === projectId);
  const projectSessions = sessions
    .filter(s => s.project_id === projectId)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    setIsSending(true);
    try {
      await sendMessage(input, [], 'medium', null, projectId);
      setInput('');
      navigate('/chat');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const openSession = (session) => {
    navigate('/chat', { state: { sessionId: session.id } });
  };

  return (
    <div className="flex flex-col flex-1 w-full relative">
      <div className="flex items-center gap-3 p-4 border-b border-[var(--border)] sticky top-0 bg-[var(--bg)] z-10">
        <button 
          onClick={() => navigate('/projects')}
          className="p-2 text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--hover)] rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
          <Folder size={16} />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-[var(--text)] leading-tight">
            {project?.name || 'Loading Project...'}
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-center bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm px-4 py-3 mb-8 focus-within:ring-2 focus-within:ring-[var(--primary)]/50 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`New chat in ${project?.name || 'project'}`}
              disabled={isSending}
              className="flex-1 bg-transparent border-none outline-none text-[var(--text)] placeholder-[var(--text-secondary)] text-base"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isSending}
              className="p-2 rounded-xl bg-[var(--primary)] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shrink-0"
            >
              <Send size={18} />
            </button>
          </div>

          {projectSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16">
              <div className="w-16 h-16 bg-[var(--surface-2)] rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-[var(--border)]">
                <MessageSquare size={32} className="text-[var(--primary)]" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--text)] mb-2">No chats yet</h2>
              <p className="text-[var(--text-secondary)] max-w-sm">
                Chats you start in this project will show up here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {projectSessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => openSession(session)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left hover:bg-[var(--surface-2)] transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <MessageSquare size={16} className="text-[var(--text-secondary)] shrink-0" />
                    <span className="text-sm font-medium text-[var(--text)] truncate">{session.title}</span>
                  </div>
                  <span className="text-xs text-[var(--text-secondary)] shrink-0 ml-4">
                    {format(new Date(session.updated_at), 'MMM d, h:mm a')}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
