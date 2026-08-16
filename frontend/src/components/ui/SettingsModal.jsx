import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Palette, Bell, Database, CheckCircle, Bookmark } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSettings } from '../../context/SettingsContext';
import { useChat } from '../../context/ChatContext';
import { cn } from '../../utils/cn';
import { requestDesktopPermission } from '../../utils/notify';

const TABS = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'personalization', label: 'Personalization', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'data', label: 'Data controls', icon: Database },
];

export const SettingsModal = ({ isOpen, onClose, initialTab }) => {
  const { 
    theme, setTheme, contrast, setContrast, accentColor, setAccentColor,
    soundEnabled, setSoundEnabled,
    desktopNotifEnabled, setDesktopNotifEnabled,
    responseAlertsEnabled, setResponseAlertsEnabled,
    taskReminderEnabled, setTaskReminderEnabled,
    emailNotifEnabled, setEmailNotifEnabled,
  } = useSettings();
  const { userProfile, updateUserProfile, savedMessages, fetchSavedMessages, unsaveMessage, loadSession } = useChat();
  const [activeTab, setActiveTab] = useState(initialTab || 'general');
  const [expandedMessage, setExpandedMessage] = useState(null);

  const [nickname, setNickname] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [isSavingPersonalization, setIsSavingPersonalization] = useState(false);
  const [personalizationSaved, setPersonalizationSaved] = useState(false);

  const [occupation, setOccupation] = useState('');

  const [language, setLanguage] = useState('en-US');
  const [higherIntelligence, setHigherIntelligence] = useState(true);
  const [dictationEnabled, setDictationEnabled] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setNickname(userProfile?.nickname || '');
      setCustomInstructions(userProfile?.custom_instructions || '');
      setOccupation(userProfile?.occupation || '');
      setPersonalizationSaved(false);
      if (initialTab) {
        setActiveTab(initialTab);
      }
    } else {
      setExpandedMessage(null);
    }
  }, [isOpen, userProfile, initialTab]);

  useEffect(() => {
    if (isOpen && activeTab === 'data') {
      fetchSavedMessages();
    }
  }, [isOpen, activeTab, fetchSavedMessages]);

  const handleGoToChat = (sessionId) => {
    if (sessionId && loadSession) {
      loadSession(sessionId);
    }
    onClose();
  };

  const MIN_SAVE_FEEDBACK_MS = 1200;

  const handleDesktopToggle = async () => {
    if (!desktopNotifEnabled) {
      const result = await requestDesktopPermission();
      if (result === 'granted') {
        setDesktopNotifEnabled(true);
      }
    } else {
      setDesktopNotifEnabled(false);
    }
  };

  const handleSavePersonalization = async () => {
    setIsSavingPersonalization(true);
    setPersonalizationSaved(false);
    const startedAt = Date.now();
    try {
      await updateUserProfile({ nickname, custom_instructions: customInstructions, occupation });
      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_SAVE_FEEDBACK_MS) {
        await new Promise(resolve => setTimeout(resolve, MIN_SAVE_FEEDBACK_MS - elapsed));
      }
      setPersonalizationSaved(true);
      setNickname('');
      setCustomInstructions('');
      setOccupation('');
      setTimeout(() => setPersonalizationSaved(false), 2500);
    } finally {
      setIsSavingPersonalization(false);
    }
  };

  const handleRemovePersonalization = async () => {
    setIsSavingPersonalization(true);
    setPersonalizationSaved(false);
    const startedAt = Date.now();
    try {
      await updateUserProfile({ nickname: '', custom_instructions: '', occupation: '' });
      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_SAVE_FEEDBACK_MS) {
        await new Promise(resolve => setTimeout(resolve, MIN_SAVE_FEEDBACK_MS - elapsed));
      }
      setNickname('');
      setCustomInstructions('');
      setOccupation('');
    } finally {
      setIsSavingPersonalization(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <AnimatePresence>
            {personalizationSaved && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-6 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-2 bg-green-600 text-white pl-4 pr-2 py-2.5 rounded-full shadow-lg text-sm font-medium"
              >
                <CheckCircle size={18} />
                Personalization updated
                <button
                  onClick={() => setPersonalizationSaved(false)}
                  className="ml-1 p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

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
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-[var(--surface)] shadow-[0_20px_60px_rgb(0,0,0,0.12)] border border-[var(--border)] overflow-hidden flex h-[600px] max-h-[85vh] sm:w-[90vw]"
          >
            {/* LEFT PANEL */}
            <div className="w-64 bg-[var(--surface-2)] flex flex-col border-r border-[var(--border)] shrink-0 hidden md:flex">
              <div className="p-4 pl-6 pb-2 mt-2">
                <h2 className="text-lg font-bold text-[var(--text)]">Settings</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                        activeTab === tab.id
                          ? "bg-[var(--surface)] text-[var(--text)] shadow-sm border border-[var(--border)]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--hover)] hover:text-[var(--text)] border border-transparent"
                      )}
                    >
                      <Icon size={18} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Mobile Tab selector (shown only on small screens) */}
            <div className="md:hidden absolute top-4 left-4 z-10 w-48">
               <select
                 value={activeTab}
                 onChange={(e) => setActiveTab(e.target.value)}
                 className="w-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] text-sm rounded-lg focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] block px-3 py-2 outline-none transition-colors"
               >
                 {TABS.map(tab => (
                   <option key={tab.id} value={tab.id}>{tab.label}</option>
                 ))}
               </select>
            </div>

            {/* RIGHT PANEL */}
            <div className="flex-1 flex flex-col bg-[var(--surface)] relative min-w-0">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--hover)] hover:text-[var(--text)] transition-colors z-10"
              >
                <X size={20} />
              </button>

              <div className="flex-1 overflow-y-auto p-6 md:p-10 pt-16 md:pt-10 custom-scrollbar">
                {activeTab === 'general' ? (
                  <div className="max-w-2xl mx-auto md:ml-0 md:pl-2">
                    <h3 className="text-xl font-bold text-[var(--text)] mb-6 hidden md:block">General</h3>
                    
                    <div className="space-y-0 divide-y divide-[var(--border)]">
                      {/* Theme Row */}
                      <div className="flex items-center justify-between py-5">
                        <span className="text-[15px] font-[500] text-[var(--text)]">Theme</span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={theme === 'dark'}
                          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                          className={cn(
                            "relative inline-flex h-7 w-12 items-center rounded-full transition-colors outline-none",
                            theme === 'dark' ? "bg-[var(--primary)]" : "bg-[var(--surface-2)] border border-[var(--border)]"
                          )}
                        >
                          <span
                            className={cn(
                              "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
                              theme === 'dark' ? "translate-x-6" : "translate-x-1"
                            )}
                          />
                        </button>
                      </div>

                      {/* Contrast Row */}
                      <div className="flex items-center justify-between py-5">
                        <span className="text-[15px] font-[500] text-[var(--text)]">Contrast</span>
                        <select
                          value={contrast}
                          onChange={(e) => setContrast(e.target.value)}
                          className="bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] text-sm rounded-lg focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] block px-4 py-2 outline-none transition-colors"
                        >
                          <option value="system">System</option>
                          <option value="standard">Standard</option>
                          <option value="high">High</option>
                        </select>
                      </div>

                      {/* Accent Color Row */}
                      <div className="flex items-center justify-between py-5">
                        <span className="text-[15px] font-[500] text-[var(--text)]">Accent color</span>
                        <div className="flex items-center gap-2">
                          {accentColor !== 'default' && (
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: accentColor }}
                            />
                          )}
                          <select
                            value={accentColor}
                            onChange={(e) => setAccentColor(e.target.value)}
                            className="bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] text-sm rounded-lg focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] block px-3 py-1.5 outline-none transition-colors"
                          >
                            <option value="default" className="bg-[var(--surface-2)] text-[var(--text)]">Default</option>
                            <option value="#8B5CF6" className="bg-[var(--surface-2)] text-[var(--text)]">Purple</option>
                            <option value="#3B82F6" className="bg-[var(--surface-2)] text-[var(--text)]">Blue</option>
                            <option value="#22C55E" className="bg-[var(--surface-2)] text-[var(--text)]">Green</option>
                            <option value="#EAB308" className="bg-[var(--surface-2)] text-[var(--text)]">Yellow</option>
                            <option value="#F97316" className="bg-[var(--surface-2)] text-[var(--text)]">Orange</option>
                            <option value="#EC4899" className="bg-[var(--surface-2)] text-[var(--text)]">Pink</option>
                          </select>
                        </div>
                      </div>

                      {/* Language Row */}
                      <div className="flex items-center justify-between py-5">
                        <span className="text-[15px] font-[500] text-[var(--text)]">Language</span>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] text-sm rounded-lg focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] block px-4 py-2 outline-none transition-colors"
                        >
                          <option value="en-US">English (US)</option>
                          <option value="hi">Hindi</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                        </select>
                      </div>

                      {/* Higher Intelligence Row */}
                      <div className="flex items-center justify-between py-5 gap-4">
                        <div>
                          <span className="text-[15px] font-[500] text-[var(--text)] block mb-1">Higher intelligence</span>
                          <p className="text-xs text-[var(--text-secondary)]">
                            The assistant can automatically use a higher intelligence setting when you ask a complex question.
                          </p>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={higherIntelligence}
                          onClick={() => setHigherIntelligence(!higherIntelligence)}
                          className={cn(
                            "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors outline-none",
                            higherIntelligence ? "bg-[var(--primary)]" : "bg-[var(--surface-2)] border border-[var(--border)]"
                          )}
                        >
                          <span
                            className={cn(
                              "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
                              higherIntelligence ? "translate-x-6" : "translate-x-1"
                            )}
                          />
                        </button>
                      </div>

                      {/* Enable Dictation Row */}
                      <div className="flex items-center justify-between py-5 gap-4">
                        <div>
                          <span className="text-[15px] font-[500] text-[var(--text)] block mb-1">Enable Dictation</span>
                          <p className="text-xs text-[var(--text-secondary)]">
                            Use dictation in the chat composer.
                          </p>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={dictationEnabled}
                          onClick={() => setDictationEnabled(!dictationEnabled)}
                          className={cn(
                            "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors outline-none",
                            dictationEnabled ? "bg-[var(--primary)]" : "bg-[var(--surface-2)] border border-[var(--border)]"
                          )}
                        >
                          <span
                            className={cn(
                              "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
                              dictationEnabled ? "translate-x-6" : "translate-x-1"
                            )}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : activeTab === 'personalization' ? (
                  <div className="max-w-2xl mx-auto md:ml-0 md:pl-2">
                    <h3 className="text-xl font-bold text-[var(--text)] mb-6 hidden md:block">Personalization</h3>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-[15px] font-[500] text-[var(--text)] mb-2">
                          What should the AI call you?
                        </label>
                        <p className="text-xs text-[var(--text-secondary)] mb-2">
                          The AI will use this name to address you personally in conversations.
                        </p>
                        <input
                          type="text"
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          placeholder="Enter the name you'd like to be called"
                          className="w-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] text-sm rounded-lg focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] px-4 py-2.5 outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[15px] font-[500] text-[var(--text)] mb-2">
                          Occupation
                        </label>
                        <p className="text-xs text-[var(--text-secondary)] mb-2">
                          The AI will tailor examples and explanations to fit your line of work.
                        </p>
                        <input
                          type="text"
                          value={occupation}
                          onChange={(e) => setOccupation(e.target.value)}
                          placeholder="Enter your occupation"
                          className="w-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] text-sm rounded-lg focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] px-4 py-2.5 outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[15px] font-[500] text-[var(--text)] mb-2">
                          Custom instructions
                        </label>
                        <p className="text-xs text-[var(--text-secondary)] mb-2">
                          Describe how you'd like the AI to respond — its tone, language, level of detail, or any other preference. These instructions are applied automatically to every conversation.
                        </p>
                        <textarea
                          value={customInstructions}
                          onChange={(e) => setCustomInstructions(e.target.value)}
                          rows={5}
                          placeholder="Describe your preferences here, for example the tone, language, or detail level you want in responses."
                          className="w-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] text-sm rounded-lg focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] px-4 py-2.5 outline-none transition-colors resize-none custom-scrollbar"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleSavePersonalization}
                          disabled={isSavingPersonalization}
                          className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          {isSavingPersonalization ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleRemovePersonalization}
                          disabled={isSavingPersonalization}
                          className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--hover)] transition-colors disabled:opacity-50"
                        >
                          Remove instructions
                        </button>

                      </div>
                    </div>
                  </div>
                ) : activeTab === 'data' ? (
                  <div className="max-w-2xl mx-auto md:ml-0 md:pl-2">
                    <h3 className="text-xl font-bold text-[var(--text)] mb-6 hidden md:block">Data controls</h3>
                    {savedMessages?.length === 0 || !savedMessages ? (
                      <div className="flex flex-col items-center justify-center text-center py-16">
                        <Bookmark size={32} className="text-[var(--text-secondary)] mb-3" />
                        <p className="text-[var(--text-secondary)] text-sm">No saved messages yet. Save a response from the chat to see it here.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {savedMessages.map((msg) => (
                          <div
                            key={msg.id}
                            onClick={() => setExpandedMessage(msg)}
                            className="flex flex-col gap-2 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] cursor-pointer hover:border-[var(--primary)] transition-colors"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleGoToChat(msg.session_id); }}
                                className="text-xs font-medium text-[var(--primary)] hover:underline truncate max-w-[70%] text-left"
                                title="Go to this chat"
                              >
                                {msg.session_title || 'Untitled chat'}
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); unsaveMessage(msg.id); }}
                                className="text-xs font-medium text-[var(--text-secondary)] hover:text-red-500 transition-colors shrink-0"
                              >
                                Remove
                              </button>
                            </div>
                            <p className="text-sm text-[var(--text)] line-clamp-3">{msg.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : activeTab === 'notifications' ? (
                  <div className="max-w-2xl mx-auto md:ml-0 md:pl-2">
                    <h3 className="text-xl font-bold text-[var(--text)] mb-6 hidden md:block">Notifications</h3>
                    <div className="space-y-0 divide-y divide-[var(--border)]">
                      <div className="flex items-center justify-between py-5 gap-4">
                        <div>
                          <span className="text-[15px] font-[500] text-[var(--text)] block mb-1">Sound</span>
                          <p className="text-xs text-[var(--text-secondary)]">Play a sound when a new response arrives.</p>
                        </div>
                        <button type="button" role="switch" aria-checked={soundEnabled} onClick={() => setSoundEnabled(!soundEnabled)} className={cn("relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors outline-none", soundEnabled ? "bg-[var(--primary)]" : "bg-[var(--surface-2)] border border-[var(--border)]")}>
                          <span className={cn("inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform", soundEnabled ? "translate-x-6" : "translate-x-1")} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-5 gap-4">
                        <div>
                          <span className="text-[15px] font-[500] text-[var(--text)] block mb-1">Desktop notifications</span>
                          <p className="text-xs text-[var(--text-secondary)]">Show a system notification for new responses when this tab isn't focused.</p>
                        </div>
                        <button type="button" role="switch" aria-checked={desktopNotifEnabled} onClick={handleDesktopToggle} className={cn("relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors outline-none", desktopNotifEnabled ? "bg-[var(--primary)]" : "bg-[var(--surface-2)] border border-[var(--border)]")}>
                          <span className={cn("inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform", desktopNotifEnabled ? "translate-x-6" : "translate-x-1")} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-5 gap-4">
                        <div>
                          <span className="text-[15px] font-[500] text-[var(--text)] block mb-1">Response alerts</span>
                          <p className="text-xs text-[var(--text-secondary)]">Flash the browser tab title when a reply arrives while you're on another tab.</p>
                        </div>
                        <button type="button" role="switch" aria-checked={responseAlertsEnabled} onClick={() => setResponseAlertsEnabled(!responseAlertsEnabled)} className={cn("relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors outline-none", responseAlertsEnabled ? "bg-[var(--primary)]" : "bg-[var(--surface-2)] border border-[var(--border)]")}>
                          <span className={cn("inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform", responseAlertsEnabled ? "translate-x-6" : "translate-x-1")} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-5 gap-4">
                        <div>
                          <span className="text-[15px] font-[500] text-[var(--text)] block mb-1">Scheduled task reminders</span>
                          <p className="text-xs text-[var(--text-secondary)]">Get notified when a scheduled task finishes running.</p>
                        </div>
                        <button type="button" role="switch" aria-checked={taskReminderEnabled} onClick={() => setTaskReminderEnabled(!taskReminderEnabled)} className={cn("relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors outline-none", taskReminderEnabled ? "bg-[var(--primary)]" : "bg-[var(--surface-2)] border border-[var(--border)]")}>
                          <span className={cn("inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform", taskReminderEnabled ? "translate-x-6" : "translate-x-1")} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between py-5 gap-4">
                        <div>
                          <span className="text-[15px] font-[500] text-[var(--text)] block mb-1">Email notifications</span>
                          <p className="text-xs text-[var(--text-secondary)]">Receive email updates about your account activity. (Requires email delivery to be configured separately.)</p>
                        </div>
                        <button type="button" role="switch" aria-checked={emailNotifEnabled} onClick={() => setEmailNotifEnabled(!emailNotifEnabled)} className={cn("relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors outline-none", emailNotifEnabled ? "bg-[var(--primary)]" : "bg-[var(--surface-2)] border border-[var(--border)]")}>
                          <span className={cn("inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform", emailNotifEnabled ? "translate-x-6" : "translate-x-1")} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center pb-12">
                    <h3 className="text-xl font-bold text-[var(--text)] mb-3">
                      {TABS.find(t => t.id === activeTab)?.label}
                    </h3>
                    <p className="text-[var(--text-secondary)] text-sm">This section is coming soon.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
      {expandedMessage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setExpandedMessage(null)}
        >
          <div
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[var(--text)]">Saved message</h3>
              <button onClick={() => setExpandedMessage(null)} className="text-[var(--text-secondary)] hover:text-[var(--text)]">
                <X size={20} />
              </button>
            </div>
            <div className="prose prose-sm max-w-none prose-headings:text-[var(--text)] prose-p:text-[var(--text)] prose-strong:text-[var(--text)] prose-a:text-[var(--primary)] prose-code:text-[var(--text)] prose-ul:text-[var(--text)] prose-ol:text-[var(--text)] prose-li:text-[var(--text)] prose-blockquote:text-[var(--text-secondary)] prose-blockquote:border-[var(--border)] prose-table:text-[var(--text)] prose-th:text-[var(--text)] prose-td:text-[var(--text)]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {expandedMessage.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
