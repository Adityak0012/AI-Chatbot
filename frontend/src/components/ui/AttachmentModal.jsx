import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const AttachmentModal = ({ isOpen, onClose, title, content }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold text-[var(--text)]">{title}</h2>
              <button
                onClick={onClose}
                className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--hover)] rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 text-center text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">
              {content}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
