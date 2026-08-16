import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Search, X, Pencil, Check, Settings, User, SquarePen, Folder, LibraryBig, Clock, Bot, PanelLeftClose, PanelLeft, MessageCircle, Palette, LogOut, HelpCircle, MoreHorizontal, Pin, PinOff, FolderPlus, ChevronLeft } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useChat } from '../../context/ChatContext';
import { cn } from '../../utils/cn';
import { SettingsModal } from '../ui/SettingsModal';
import { SearchModal } from '../ui/SearchModal';
import { EditProfileModal } from '../ui/EditProfileModal';
import api from '../../services/api';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { sessions, currentSessionId, loadSession, deleteSession, renameSession, handleNewChat, userProfile, handleLogout, projects } = useChat();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState('general');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [openSessionDropdown, setOpenSessionDropdown] = useState(null);
  const [pinnedSessions, setPinnedSessions] = useState(() => JSON.parse(localStorage.getItem('pinnedSessions') || '[]'));
  const [showProjectSubmenu, setShowProjectSubmenu] = useState(false);
  const [isPinnedPopoverOpen, setIsPinnedPopoverOpen] = useState(false);

  const togglePin = (e, sessionId) => {
    e.stopPropagation();
    setPinnedSessions(prev => {
      const newPinned = prev.includes(sessionId) ? prev.filter(id => id !== sessionId) : [...prev, sessionId];
      localStorage.setItem('pinnedSessions', JSON.stringify(newPinned));
      return newPinned;
    });
    setOpenSessionDropdown(null);
  };

  const pinnedSessionsList = sessions.filter(s => pinnedSessions.includes(s.id));
  const unpinnedSessionsList = sessions.filter(s => !pinnedSessions.includes(s.id));

  const renderSession = (session, isPinned = false) => (
    <div
      key={session.id}
      onClick={() => {
        if (location.pathname !== '/chat') navigate('/chat', { state: { sessionId: session.id } });
        else loadSession(session.id);
        if (window.innerWidth < 768) setIsMobileOpen(false);
      }}
      className={cn(
        "w-full h-[40px] flex items-center justify-between px-[12px] rounded-[10px] cursor-pointer group transition-colors duration-200 ease-in-out",
        currentSessionId === session.id
          ? "bg-[var(--surface-2)]"
          : "bg-transparent hover:bg-[var(--surface-2)]"
      )}
    >
      <div className="flex items-center flex-1 min-w-0 h-full gap-2">
        {isPinned && <MessageCircle size={14} className="text-[var(--text-secondary)] shrink-0" />}
        {editingSessionId === session.id ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleEditSave(e, session.id);
              if (e.key === 'Escape') handleEditCancel(e);
            }}
            onBlur={(e) => handleEditSave(e, session.id)}
            className="flex-1 bg-[var(--surface)] border border-[var(--primary)] rounded px-1.5 py-0.5 text-sm text-[var(--text)] focus:outline-none min-w-0"
            autoFocus
          />
        ) : (
          <span className={cn(
            "block truncate text-[14px] text-[var(--text)]",
            currentSessionId === session.id ? "font-semibold" : "font-[500]"
          )}>
            {session.title}
          </span>
        )}
      </div>
      <div className={cn("flex items-center gap-1 shrink-0 ml-2 relative", openSessionDropdown === session.id ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
        {editingSessionId === session.id ? (
          <button
            onClick={(e) => handleEditSave(e, session.id)}
            className="p-1.5 text-green-500 hover:bg-[var(--surface)] rounded-md transition-all"
            title="Save"
          >
            <Check size={16} />
          </button>
        ) : (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenSessionDropdown(openSessionDropdown === session.id ? null : session.id);
                setShowProjectSubmenu(false);
              }}
              className="p-1 text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-md transition-all"
              title="More options"
            >
              <MoreHorizontal size={18} />
            </button>

            <AnimatePresence>
              {openSessionDropdown === session.id && (
                <>
                  <div className="fixed inset-0 z-40 cursor-default" onClick={(e) => { e.stopPropagation(); setOpenSessionDropdown(null); }} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                    className="absolute -right-2 bottom-full mb-1 origin-bottom-right w-[160px] bg-[var(--surface-2)] border border-[var(--border)] rounded-xl shadow-lg z-50 overflow-hidden py-1"
                  >
                    {showProjectSubmenu ? (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); setShowProjectSubmenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors">
                          <ChevronLeft size={14} /> Back
                        </button>
                        <div className="h-px bg-[var(--border)] my-1 mx-2" />
                        <div className="max-h-40 overflow-y-auto custom-scrollbar">
                          {(!projects || projects.length === 0) ? (
                            <div className="px-3 py-2 text-xs text-[var(--text-secondary)]">No projects found.</div>
                          ) : (
                            projects.map(p => (
                              <button key={p.id} onClick={(e) => { e.stopPropagation(); setOpenSessionDropdown(null); setShowProjectSubmenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--hover)] transition-colors truncate">
                                <Folder size={14} className="shrink-0 text-[var(--text-secondary)]" />
                                <span className="truncate">{p.name}</span>
                              </button>
                            ))
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => togglePin(e, session.id)}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--hover)] transition-colors"
                        >
                          {pinnedSessions.includes(session.id) ? (
                            <>
                              <PinOff size={16} className="text-[var(--text-secondary)]" />
                              Unpin
                            </>
                          ) : (
                            <>
                              <Pin size={16} className="text-[var(--text-secondary)]" />
                              Pin
                            </>
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowProjectSubmenu(true);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--hover)] transition-colors"
                        >
                          <FolderPlus size={16} className="text-[var(--text-secondary)]" />
                          Add to project
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenSessionDropdown(null);
                            handleEditStart(e, session);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--hover)] transition-colors"
                        >
                          <Pencil size={16} className="text-[var(--text-secondary)]" />
                          Rename
                        </button>

                        <div className="h-px bg-[var(--border)] my-1 mx-2" />

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenSessionDropdown(null);
                            deleteSession(session.id);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-[var(--hover)] hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );

  const handleEditStart = (e, session) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitle(session.title);
  };

  const handleEditSave = (e, sessionId) => {
    e.stopPropagation();
    if (editTitle.trim() && editTitle.trim() !== sessions.find(s => s.id === sessionId)?.title) {
      renameSession(sessionId, editTitle.trim());
    }
    setEditingSessionId(null);
    setEditTitle('');
  };

  const handleEditCancel = (e) => {
    e.stopPropagation();
    setEditingSessionId(null);
    setEditTitle('');
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <motion.aside
        initial={{ width: 280, x: -300 }}
        animate={{
          width: isCollapsed && window.innerWidth >= 768 ? 72 : 280,
          x: isMobileOpen || window.innerWidth >= 768 ? 0 : -300
        }}
        transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 flex flex-col shrink-0 overflow-visible",
          "bg-[var(--sidebar)] border-r border-[var(--border)]",
          "shadow-xl md:shadow-none transition-colors duration-300"
        )}
      >
        {isCollapsed ? (
          <div className="flex flex-col items-center py-4 w-full h-full gap-2">
            <button
              onClick={() => setIsCollapsed(false)}
              className="group h-11 w-11 flex items-center justify-center rounded-xl hover:bg-[var(--surface-2)] transition-colors mb-2"
              title="Expand sidebar"
            >
              <div className="h-8 w-8 bg-[var(--primary)] rounded-lg flex items-center justify-center shadow-sm group-hover:hidden">
                <Bot size={20} className="text-white" />
              </div>
              <div className="h-8 w-8 hidden group-hover:flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--text)]">
                <PanelLeft size={22} />
              </div>
            </button>

            <button
              onClick={() => {
                if (location.pathname !== '/chat') navigate('/chat', { state: { newChat: true } });
                else handleNewChat();
              }}
              className="h-11 w-11 flex items-center justify-center rounded-[14px] border border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] hover:border-[var(--primary)] hover:shadow-sm transition-all duration-200 active:scale-[0.98]"
              title="New chat"
            >
              <SquarePen size={20} />
            </button>

            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="h-11 w-11 flex items-center justify-center rounded-xl text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
              title="Search chats"
            >
              <Search size={20} />
            </button>

            <button
              className="h-11 w-11 flex items-center justify-center rounded-xl text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
              title="Chats"
              onClick={() => setIsCollapsed(false)}
            >
              <MessageCircle size={20} />
            </button>

            <div className="relative">
              <button
                className="h-11 w-11 flex items-center justify-center rounded-xl text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
                title="Pinned Chats"
                onClick={() => setIsPinnedPopoverOpen(!isPinnedPopoverOpen)}
              >
                <Pin size={20} />
              </button>

              <AnimatePresence>
                {isPinnedPopoverOpen && (
                  <>
                    <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsPinnedPopoverOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, x: -10, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-full top-0 ml-3 w-64 bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.24)] z-50 overflow-hidden flex flex-col"
                    >
                      <div className="px-4 py-3 font-bold text-[var(--text)] border-b border-[var(--border)]">
                        Pinned
                      </div>
                      <div className="max-h-64 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {console.log('Rendering collapsed Pin popover. isPinnedPopoverOpen:', isPinnedPopoverOpen, 'pinnedSessionsList:', pinnedSessionsList)}
                        {pinnedSessionsList.length === 0 ? (
                          <div className="px-2 py-4 text-sm text-[var(--text-secondary)] text-center">No pinned chats</div>
                        ) : (
                          pinnedSessionsList.map(session => (
                            <button
                              key={session.id}
                              onClick={() => {
                                if (location.pathname !== '/chat') navigate('/chat', { state: { sessionId: session.id } });
                                else loadSession(session.id);
                                setIsPinnedPopoverOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-[500] text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-all text-left group/pinrow"
                            >
                              <MessageCircle size={16} className="text-[var(--primary)] shrink-0 opacity-70 group-hover/pinrow:opacity-100 transition-opacity" />
                              <span className="truncate flex-1">{session.title}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1" />

            <div
              className="flex items-center justify-center p-1 w-11 h-11 rounded-xl hover:bg-[var(--surface-2)] transition-colors cursor-pointer mb-2 relative"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              title="Profile menu"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-white shadow-md overflow-hidden">
                {userProfile?.avatar_url ? (
                  <img src={`${api.defaults.baseURL}${userProfile.avatar_url}`} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-semibold text-sm">
                    {userProfile?.username?.charAt(0).toUpperCase() || <User size={16} />}
                  </span>
                )}
              </div>

              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40 cursor-default" onClick={(e) => { e.stopPropagation(); setIsProfileDropdownOpen(false); }} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full left-0 mb-2 w-[220px] bg-[var(--surface-2)] border border-[var(--border)] rounded-xl shadow-lg z-50 overflow-hidden py-1"
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); setIsProfileDropdownOpen(false); setSettingsInitialTab('personalization'); setIsSettingsOpen(true); }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors"
                      >
                        <Palette size={16} />
                        Personalization
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setIsProfileDropdownOpen(false); setIsEditProfileOpen(true); }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors"
                      >
                        <User size={16} />
                        Profile
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsProfileDropdownOpen(false);
                          setSettingsInitialTab('general');
                          setIsSettingsOpen(true);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors"
                      >
                        <Settings size={16} />
                        Settings
                      </button>

                      <div className="h-px bg-[var(--border)] my-1 mx-2" />

                      <button
                        onClick={(e) => { e.stopPropagation(); setIsProfileDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors"
                      >
                        <HelpCircle size={16} />
                        Help
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors"
                      >
                        <LogOut size={16} />
                        Log out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="flex flex-col w-full h-full">
            {/* Fixed Top Header */}
            <div className="p-4 shrink-0">
              <div className="flex items-center h-8 relative w-full justify-between">
                <div className="flex items-center gap-2 shrink-0">
                  <div className="h-8 w-8 bg-[var(--primary)] rounded-lg flex items-center justify-center shadow-sm shrink-0">
                    <Bot size={20} className="text-white" />
                  </div>
                </div>

                <div className="flex items-center z-10 relative gap-1 flex-1 justify-end ml-2">
                  <button
                    onClick={() => setIsSearchModalOpen(true)}
                    className="text-[var(--text-secondary)] hover:text-[var(--text)] rounded-lg hover:bg-[var(--surface-2)] transition-colors p-1.5"
                    title="Search chats"
                  >
                    <Search size={20} />
                  </button>
                  <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden md:flex p-1.5 text-[var(--text-secondary)] hover:text-[var(--text)] rounded-lg hover:bg-[var(--surface-2)] transition-colors"
                    title="Collapse sidebar"
                  >
                    <PanelLeftClose size={20} />
                  </button>
                  <button onClick={() => setIsMobileOpen(false)} className="md:hidden p-1 text-[var(--text-secondary)] rounded-lg hover:bg-[var(--hover)] transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Middle Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth flex flex-col">
              <div className="flex flex-col gap-1 w-full px-4 pb-4">
                <button
                  onClick={() => {
                    if (location.pathname !== '/chat') navigate('/chat', { state: { newChat: true } });
                    else handleNewChat();
                    if (window.innerWidth < 768) setIsMobileOpen(false);
                  }}
                  className="w-full h-[40px] flex items-center gap-3 px-3 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors text-[15px] font-[500] cursor-pointer"
                  title="New chat"
                >
                  <SquarePen size={18} className="shrink-0" />
                  New chat
                </button>

                <Link
                  to="/library"
                  onClick={() => window.innerWidth < 768 && setIsMobileOpen(false)}
                  className={cn("w-full h-[40px] flex items-center gap-3 px-3 rounded-lg text-[15px] transition-colors", location.pathname === '/library' ? "text-[var(--text)] font-semibold bg-[var(--hover)]" : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--hover)] font-[500]")}
                >
                  <LibraryBig size={18} className="shrink-0" />
                  Library
                </Link>

                <Link
                  to="/projects"
                  onClick={() => window.innerWidth < 768 && setIsMobileOpen(false)}
                  className={cn("w-full h-[40px] flex items-center gap-3 px-3 rounded-lg text-[15px] transition-colors", location.pathname === '/projects' ? "text-[var(--text)] font-semibold bg-[var(--hover)]" : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--hover)] font-[500]")}
                >
                  <Folder size={18} className="shrink-0" />
                  Projects
                </Link>

                <Link
                  to="/scheduled"
                  onClick={() => window.innerWidth < 768 && setIsMobileOpen(false)}
                  className={cn("w-full h-[40px] flex items-center gap-3 px-3 rounded-lg text-[15px] transition-colors", location.pathname === '/scheduled' ? "text-[var(--text)] font-semibold bg-[var(--hover)]" : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--hover)] font-[500]")}
                >
                  <Clock size={18} className="shrink-0" />
                  Scheduled
                </Link>
              </div>

              <div className="px-3 pb-4">
                {pinnedSessionsList.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-[var(--text-secondary)] mb-2 px-3 mt-2 uppercase tracking-wider">
                      Pinned
                    </div>
                    {pinnedSessionsList.map(session => renderSession(session, true))}
                  </div>
                )}

                <div className="text-xs font-semibold text-[var(--text-secondary)] mb-2 px-3 mt-2 uppercase tracking-wider">
                  Recents
                </div>
                {unpinnedSessionsList.length === 0 ? (
                  <div className="px-3 text-sm text-[var(--text-secondary)]">No chats found.</div>
                ) : (
                  unpinnedSessionsList.map(session => renderSession(session, false))
                )}
              </div>
            </div>

            {/* Fixed Bottom Profile */}
            <div className="border-t border-[var(--border)] border-b-0 border-x-0 shrink-0 p-4 relative mt-auto">
              <div
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center justify-between cursor-pointer group/profile"
              >
                <div className="flex items-center min-w-0 gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-white shrink-0 overflow-hidden">
                    {userProfile?.avatar_url ? (
                      <img src={`${api.defaults.baseURL}${userProfile.avatar_url}`} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-semibold text-sm">
                        {userProfile?.username?.charAt(0).toUpperCase() || <User size={16} />}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col truncate">
                    <p className="text-sm font-semibold text-[var(--text)] truncate leading-tight">
                      {userProfile?.full_name || userProfile?.username || 'User'}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5 font-medium opacity-80">
                      {userProfile?.email || 'Free plan'}
                    </p>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40 cursor-default" onClick={(e) => { e.stopPropagation(); setIsProfileDropdownOpen(false); }} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full left-4 mb-2 w-[calc(100%-32px)] bg-[var(--surface-2)] border border-[var(--border)] rounded-xl shadow-lg z-50 overflow-hidden py-1"
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); setIsProfileDropdownOpen(false); setSettingsInitialTab('personalization'); setIsSettingsOpen(true); }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors"
                      >
                        <Palette size={16} />
                        Personalization
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setIsProfileDropdownOpen(false); setIsEditProfileOpen(true); }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors"
                      >
                        <User size={16} />
                        Profile
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsProfileDropdownOpen(false);
                          setSettingsInitialTab('general');
                          setIsSettingsOpen(true);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors"
                      >
                        <Settings size={16} />
                        Settings
                      </button>

                      <div className="h-px bg-[var(--border)] my-1 mx-2" />

                      <button
                        onClick={(e) => { e.stopPropagation(); setIsProfileDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors"
                      >
                        <HelpCircle size={16} />
                        Help
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors"
                      >
                        <LogOut size={16} />
                        Log out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          initialTab={settingsInitialTab}
        />
        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
        />
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
        />
      </motion.aside>
    </>
  );
};
