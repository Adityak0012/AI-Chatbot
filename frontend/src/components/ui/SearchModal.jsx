import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, MessageCircle } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export const SearchModal = ({ isOpen, onClose }) => {
  const { sessions, loadSession } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed left-1/2 top-[10%] z-50 w-full max-w-2xl -translate-x-1/2 rounded-2xl bg-[var(--surface)] shadow-2xl border border-[var(--border)] overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="flex items-center px-4 py-3 border-b border-[var(--border)]">
              <Search size={22} className="text-[var(--text-secondary)] mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-[16px] text-[var(--text)] placeholder-[var(--placeholder)]"
              />
              <button
                onClick={onClose}
                className="ml-2 rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-2 custom-scrollbar">
              {searchQuery && filteredSessions.length === 0 ? (
                <div className="px-4 py-8 text-center text-[var(--text-secondary)]">
                  No chats found for "{searchQuery}"
                </div>
              ) : (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    {searchQuery ? 'Search Results' : 'Recent Chats'}
                  </div>
                  <div className="flex flex-col gap-1 mt-1">
                    {filteredSessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => {
                          loadSession(session.id);
                          onClose();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[var(--surface-2)] transition-colors text-left group"
                      >
                        <div className="p-2 rounded-lg bg-[var(--surface-2)] group-hover:bg-[var(--surface)] transition-colors">
                          <MessageCircle size={18} className="text-[var(--text-secondary)] group-hover:text-[var(--primary)] transition-colors" />
                        </div>
                        <span className="flex-1 truncate text-[15px] text-[var(--text)] font-medium">
                          {session.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
