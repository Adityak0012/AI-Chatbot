import React, { useRef, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';

export const ChatArea = () => {
  const { messages, isSending, sendMessage, loadSession, handleNewChat, currentSessionId } = useChat();
  const messagesEndRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.sessionId && location.state.sessionId !== currentSessionId) {
      loadSession(location.state.sessionId);
      navigate(location.pathname, { replace: true, state: {} });
    } else if (location.state?.newChat) {
      handleNewChat();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, currentSessionId, loadSession, handleNewChat, navigate, location.pathname]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isSending]);

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full relative">
      <div id="chat-messages-area" className="flex-1 overflow-y-auto custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 bg-[var(--surface-2)] rounded-2xl flex items-center justify-center mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <Bot size={32} className="text-[var(--primary)]" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text)] mb-2 tracking-tight">How can I help you today?</h2>
            <p className="text-[var(--text-secondary)] max-w-md">
              I'm your AI assistant. Ask me anything, and I'll do my best to help you out.
            </p>
          </div>
        ) : (
          <div className="w-full max-w-3xl mx-auto pb-40 pt-4 px-4 md:px-0">
            {messages.map((msg, index) => (
              <MessageBubble key={index} message={msg} index={index} />
            ))}
            {isSending && messages[messages.length - 1]?.role !== 'ai' && (
              <MessageBubble message={{ role: 'ai', content: '' }} isTyping={true} />
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="shrink-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)] to-transparent pt-10 pb-0 absolute bottom-0 left-0 right-0 w-full z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <ChatInput onSend={sendMessage} isSending={isSending} currentSessionId={currentSessionId} />
        </div>
      </div>
    </div>
  );
};
