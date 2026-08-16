import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import api from '../../services/api';

export const EditProfileModal = ({ isOpen, onClose }) => {
  const { userProfile, updateUserProfile, uploadAvatar } = useChat();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const avatarSrc = userProfile?.avatar_url
    ? `${api.defaults.baseURL}${userProfile.avatar_url}`
    : null;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    setError('');
    try {
      await uploadAvatar(file);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload avatar.');
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    if (isOpen) {
      setDisplayName(userProfile?.full_name || '');
      setUsername(userProfile?.username || '');
      setError('');
    }
  }, [isOpen, userProfile]);

  const initials = (displayName || userProfile?.full_name || 'U')
    .trim()
    .split(' ')
    .map(part => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      await updateUserProfile({ full_name: displayName.trim(), username: username.trim() });
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-[var(--surface)] p-6 shadow-[0_20px_60px_rgb(0,0,0,0.2)] border border-[var(--border)]"
          >
            <h2 className="text-xl font-semibold text-[var(--text)] mb-6">Edit profile</h2>

            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-semibold border-2 border-[var(--border)] overflow-hidden">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                  title="Change avatar"
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors disabled:opacity-50"
                >
                  <Camera size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  Display name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
                />
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Only lowercase letters, numbers, and underscores.
                </p>
              </div>
            </div>

            <p className="text-xs text-[var(--text-secondary)] text-center mt-4">
              Your profile helps people recognize you in group chats.
            </p>

            {error && (
              <p className="text-xs text-red-500 text-center mt-2">{error}</p>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--text)] bg-[var(--surface-2)] hover:bg-[var(--hover)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
