import React, { useRef, useEffect } from 'react';
import { WifiOff, Clock, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';

export const ChatArea = () => {
  const { messages, isSending, sendMessage, loadSession, handleNewChat, currentSessionId, error, errorType, userProfile } = useChat();
  const messagesEndRef = useRef(null);
  const initialMessageSent = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.sessionId && location.state.sessionId !== currentSessionId) {
      loadSession(location.state.sessionId);
      navigate(location.pathname, { replace: true, state: {} });
    } else if (location.state?.newChat) {
      handleNewChat();
      const initialMsg = location.state?.initialMessage;
      navigate(location.pathname, { replace: true, state: {} });
      if (initialMsg && !initialMessageSent.current) {
        initialMessageSent.current = true;
        setTimeout(() => sendMessage(initialMsg), 100);
      }
    }
  }, [location.state?.sessionId, location.state?.newChat, location.state?.initialMessage, currentSessionId]);

  const containerRef = useRef(null);
  const userScrolledUp = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
      userScrolledUp.current = !isNearBottom;
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!userScrolledUp.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'instant', block: 'end' });
    }
  }, [messages, isSending]);



  return (
    <div className="flex flex-col flex-1 min-h-0 w-full relative">
      <div id="chat-messages-area" ref={containerRef} className="flex-1 overflow-y-auto custom-scrollbar">
        {messages.length === 0 ? (
          /* ── Empty state: greeting + composer grouped and centered ── */
          <div className="h-full flex flex-col items-center justify-center px-4">
            {(() => {
              const hour = new Date().getHours();
              const greeting = hour >= 5 && hour < 12 ? 'Good morning'
                : hour >= 12 && hour < 17 ? 'Good afternoon'
                : hour >= 17 && hour < 21 ? 'Good evening'
                : 'Good night';
              const timeOfDay = hour >= 5 && hour < 12 ? 'Morning'
                : hour >= 12 && hour < 17 ? 'Afternoon'
                : hour >= 17 && hour < 21 ? 'Evening'
                : 'Night';
              const fullName = userProfile?.full_name || userProfile?.username || '';
              const firstName = fullName.split(' ')[0] || 'there';
              return (
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    borderRadius: '999px', padding: '4px 14px', marginBottom: '16px',
                    fontSize: '13px', color: 'var(--text-secondary)'
                  }}>
                    <Sparkles size={13} style={{ color: 'var(--primary)' }} />
                    {timeOfDay} • {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                  </div>
                  <h2 style={{ fontSize: '2.5rem', fontWeight: 300, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>
                    {greeting}, <span style={{ fontWeight: 700 }}>{firstName}.</span>
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '8px' }}>
                    How can I help you today?
                  </p>
                </div>
              );
            })()}
            <ChatInput onSend={sendMessage} isSending={isSending} currentSessionId={currentSessionId} />
          </div>
        ) : (
          /* ── Messages state ── */
          <div className="w-full max-w-3xl mx-auto pb-40 pt-4 px-4 md:px-0">
            {messages.map((msg, index) => (
              <MessageBubble key={index} message={msg} index={index} />
            ))}
            {isSending && (
              messages[messages.length - 1]?.role !== 'ai' ||
              messages[messages.length - 1]?.content === ''
            ) && (
              <MessageBubble message={{ role: 'ai', content: '' }} isTyping={true} />
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom-pinned composer — only when there are messages */}
      {messages.length > 0 && (
        <div className="shrink-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)] to-transparent pt-10 pb-0 absolute bottom-0 left-0 right-0 w-full z-10 pointer-events-none">
          <div className="pointer-events-auto">
            {error && (
              <div className="mx-auto max-w-3xl px-4 mb-2">
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium
                  ${errorType === 'network' ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400' :
                    errorType === 'timeout' ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400' :
                    errorType === 'rate_limit' ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400' :
                    'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                  {errorType === 'network' ? <WifiOff size={16} /> :
                   errorType === 'timeout' ? <Clock size={16} /> :
                   errorType === 'rate_limit' ? <RefreshCw size={16} /> :
                   <AlertTriangle size={16} />}
                  <span>{error}</span>
                </div>
              </div>
            )}
            <ChatInput onSend={sendMessage} isSending={isSending} currentSessionId={currentSessionId} />
          </div>
        </div>
      )}
    </div>
  );
};
