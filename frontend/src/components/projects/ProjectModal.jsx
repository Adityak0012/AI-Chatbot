import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ProjectModal = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onCreate({ name: name.trim(), description: description.trim() });
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      setError('Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[var(--bg)] rounded-2xl shadow-2xl z-[101] border border-[var(--border)] overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold text-[var(--text)]">Create Project</h2>
              <button 
                onClick={handleClose}
                className="p-1 text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--hover)] rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (e.target.value.trim()) setError('');
                  }}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  placeholder="E.g., Website Redesign"
                  autoFocus
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none h-24"
                  placeholder="What is this project about?"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-[var(--text)] font-medium rounded-lg hover:bg-[var(--surface)] transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--primary)] hover:opacity-90 text-white font-medium rounded-lg transition-opacity disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
