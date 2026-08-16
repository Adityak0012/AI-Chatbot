import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, LogOut } from 'lucide-react';

export const Dropdown = ({ userProfile, onLogout, onOpenSettings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-white shadow-md hover:opacity-90 transition-opacity"
      >
        <span className="font-semibold text-sm">
          {userProfile?.username?.charAt(0).toUpperCase() || <User size={18} />}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 rounded-2xl bg-[var(--surface)] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[var(--border)] overflow-hidden z-50"
          >
            <div className="p-4 border-b border-[var(--border)]">
              <p className="text-sm font-semibold text-[var(--text)] truncate">
                {userProfile?.username || 'User'}
              </p>
              <p className="text-xs text-[var(--text-secondary)] truncate mt-1">
                {userProfile?.email || 'user@example.com'}
              </p>
            </div>
            <div className="p-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenSettings();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-secondary)] rounded-lg hover:bg-[var(--hover)] hover:text-[var(--text)] transition-colors"
              >
                <Settings size={16} />
                Settings
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 rounded-lg hover:bg-red-500/10 transition-colors mt-1"
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
