import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Search, X, Pencil, Check, Settings, User, SquarePen,
  Folder, LibraryBig, Clock, Bot, PanelLeftClose, MessageCircle, Palette,
  LogOut, HelpCircle, MoreHorizontal, Pin, PinOff, FolderPlus, ChevronLeft,
  Home, Compass
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useChat } from '../../context/ChatContext';
import { cn } from '../../utils/cn';
import { SettingsModal } from '../ui/SettingsModal';
import { SearchModal } from '../ui/SearchModal';
import { EditProfileModal } from '../ui/EditProfileModal';
import api from '../../services/api';

/* ── Sidebar always uses dark tokens (--sb-*) ── */
const sb = {
  bg:             'var(--sb-bg)',
  border:         'var(--sb-border)',
  divider:        'var(--sb-divider)',
  text:           'var(--sb-text)',
  textMuted:      'var(--sb-text-muted)',
  textDim:        'var(--sb-text-dim)',
  hover:          'var(--sb-hover)',
  activeBg:       'var(--sb-active-bg)',
  activeBorder:   'var(--sb-active-border)',
  gradient:       'var(--sb-gradient)',
  dropdownBg:     'var(--sb-dropdown-bg)',
  dropdownBorder: 'var(--sb-dropdown-border)',
  shadow:         'var(--sb-shadow)',
};

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const {
    sessions, currentSessionId, loadSession, deleteSession, renameSession,
    handleNewChat, userProfile, handleLogout, projects
  } = useChat();
  const location = useLocation();
  const navigate = useNavigate();

  const [isSearchModalOpen, setIsSearchModalOpen]     = useState(false);
  const [editingSessionId, setEditingSessionId]       = useState(null);
  const [editTitle, setEditTitle]                     = useState('');
  const [isSettingsOpen, setIsSettingsOpen]           = useState(false);
  const [settingsInitialTab, setSettingsInitialTab]   = useState('general');
  const [isEditProfileOpen, setIsEditProfileOpen]     = useState(false);
  const [isCollapsed, setIsCollapsed]                 = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [openSessionDropdown, setOpenSessionDropdown] = useState(null);
  const [pinnedSessions, setPinnedSessions]           = useState(
    () => JSON.parse(localStorage.getItem('pinnedSessions') || '[]')
  );
  const [showProjectSubmenu, setShowProjectSubmenu]   = useState(false);

  const togglePin = (e, sessionId) => {
    e.stopPropagation();
    setPinnedSessions(prev => {
      const next = prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId];
      localStorage.setItem('pinnedSessions', JSON.stringify(next));
      return next;
    });
    setOpenSessionDropdown(null);
  };

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

  const handleDropdownKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setOpenSessionDropdown(null);
      setIsProfileDropdownOpen(false);
      setShowProjectSubmenu(false);
    }
  }, []);

  const pinnedSessionsList   = sessions.filter(s => pinnedSessions.includes(s.id));
  const unpinnedSessionsList = sessions.filter(s => !pinnedSessions.includes(s.id));

  const groupSessionsByDate = (list) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const prev7 = new Date(today); prev7.setDate(prev7.getDate() - 7);
    const groups = { today: [], prev7: [], older: [] };
    list.forEach(s => {
      const d = new Date(s.updated_at || s.created_at);
      if (d >= today)      groups.today.push(s);
      else if (d >= prev7) groups.prev7.push(s);
      else                 groups.older.push(s);
    });
    return groups;
  };
  const groups = groupSessionsByDate(unpinnedSessionsList);

  const navItems = [
    { to: '/chat',      label: 'Home',      icon: Home,       match: p => p.startsWith('/chat') },
    { to: '/library',   label: 'Library',   icon: LibraryBig, match: p => p === '/library' },
    { to: '/projects',  label: 'Projects',  icon: Folder,     match: p => p === '/projects' },
    { to: '/scheduled', label: 'Scheduled', icon: Clock,      match: p => p === '/scheduled' },
    { to: '/explore',   label: 'Explore',   icon: Compass,    match: p => p === '/explore' },
  ];

  const profileMenuItems = [
    { icon: Palette,     label: 'Personalization', action: (e) => { e.stopPropagation(); setIsProfileDropdownOpen(false); setSettingsInitialTab('personalization'); setIsSettingsOpen(true); } },
    { icon: User,        label: 'Profile',         action: (e) => { e.stopPropagation(); setIsProfileDropdownOpen(false); setIsEditProfileOpen(true); } },
    { icon: Settings,    label: 'Settings',        action: (e) => { e.stopPropagation(); setIsProfileDropdownOpen(false); setSettingsInitialTab('general'); setIsSettingsOpen(true); } },
    { icon: HelpCircle,  label: 'Help',            action: (e) => { e.stopPropagation(); setIsProfileDropdownOpen(false); } },
  ];

  const userInitial = userProfile?.username?.charAt(0)?.toUpperCase() || 'A';
  const avatarSrc   = userProfile?.avatar_url ? `${api.defaults.baseURL}${userProfile.avatar_url}` : null;

  /* ── Reusable Avatar ── */
  const Avatar = ({ size = 32, className = '' }) => (
    <div
      className={cn('rounded-full overflow-hidden shrink-0 flex items-center justify-center text-white font-bold shadow-lg', className)}
      style={{ width: size, height: size, background: sb.gradient }}
    >
      {avatarSrc
        ? <img src={avatarSrc} alt={userProfile?.username || 'User'} className="w-full h-full object-cover" />
        : <span style={{ fontSize: size * 0.4 }}>{userInitial}</span>
      }
    </div>
  );

  /* ── Session row ── */
  const renderSession = (session, isPinned = false) => (
    <div
      key={session.id}
      role="button"
      tabIndex={0}
      aria-label={`Open chat: ${session.title}`}
      onClick={() => {
        if (location.pathname !== '/chat') navigate('/chat', { state: { sessionId: session.id } });
        else loadSession(session.id);
        if (window.innerWidth < 768) setIsMobileOpen(false);
      }}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click(); }}
      className={cn(
        'w-full h-10 flex items-center justify-between px-3 rounded-xl cursor-pointer group transition-colors duration-150',
        currentSessionId === session.id ? '' : ''
      )}
      style={{
        background: currentSessionId === session.id ? sb.activeBg : 'transparent',
      }}
      onMouseEnter={e => { if (currentSessionId !== session.id) e.currentTarget.style.background = sb.hover; }}
      onMouseLeave={e => { if (currentSessionId !== session.id) e.currentTarget.style.background = 'transparent'; }}
    >
      <div className="flex items-center flex-1 min-w-0 gap-2">
        {isPinned && <MessageCircle aria-hidden="true" size={13} style={{ color: sb.textMuted }} className="shrink-0" />}
        {editingSessionId === session.id ? (
          <input
            type="text"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onClick={e => e.stopPropagation()}
            onKeyDown={e => {
              if (e.key === 'Enter')  handleEditSave(e, session.id);
              if (e.key === 'Escape') handleEditCancel(e);
            }}
            onBlur={e => handleEditSave(e, session.id)}
            className="flex-1 rounded px-1.5 py-0.5 text-sm focus:outline-none min-w-0"
            style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${sb.activeBorder}`, color: sb.text }}
            autoFocus
          />
        ) : (
          <span
            className="block truncate text-[13.5px]"
            style={{
              color: currentSessionId === session.id ? sb.text : sb.textMuted,
              fontWeight: currentSessionId === session.id ? 600 : 400,
            }}
          >
            {session.title}
          </span>
        )}
      </div>

      <div
        className={cn('flex items-center gap-0.5 shrink-0 ml-1.5 relative', openSessionDropdown === session.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')}
        style={{ transition: 'opacity 0.15s' }}
      >
        {editingSessionId === session.id ? (
          <button
            onClick={e => handleEditSave(e, session.id)}
            aria-label="Save rename"
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: '#22c55e' }}
          >
            <Check size={15} />
          </button>
        ) : (
          <>
            <button
              onClick={e => { e.stopPropagation(); setOpenSessionDropdown(openSessionDropdown === session.id ? null : session.id); setShowProjectSubmenu(false); }}
              aria-label="More options"
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: sb.textMuted }}
              onKeyDown={handleDropdownKeyDown}
            >
              <MoreHorizontal size={16} />
            </button>

            <AnimatePresence>
              {openSessionDropdown === session.id && (
                <>
                  <div className="fixed inset-0 z-40 cursor-default" onClick={e => { e.stopPropagation(); setOpenSessionDropdown(null); }} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute -right-2 bottom-full mb-1.5 origin-bottom-right w-44 z-50 overflow-hidden py-1.5 rounded-xl"
                    style={{ background: sb.dropdownBg, border: `1px solid ${sb.dropdownBorder}`, boxShadow: sb.shadow }}
                    onKeyDown={handleDropdownKeyDown}
                  >
                    {showProjectSubmenu ? (
                      <>
                        <button
                          onClick={e => { e.stopPropagation(); setShowProjectSubmenu(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                          style={{ color: sb.textMuted }}
                        >
                          <ChevronLeft size={14} aria-hidden="true" /> Back
                        </button>
                        <div className="h-px mx-3 my-1" style={{ background: sb.divider }} />
                        <div className="max-h-40 overflow-y-auto custom-scrollbar">
                          {(!projects || projects.length === 0) ? (
                            <div className="px-3 py-2 text-xs" style={{ color: sb.textMuted }}>No projects found.</div>
                          ) : (
                            projects.map(p => (
                              <button key={p.id} onClick={e => { e.stopPropagation(); setOpenSessionDropdown(null); setShowProjectSubmenu(false); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm truncate transition-colors"
                                style={{ color: sb.text }}
                              >
                                <Folder size={13} aria-hidden="true" style={{ color: sb.textMuted }} className="shrink-0" />
                                <span className="truncate">{p.name}</span>
                              </button>
                            ))
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <button onClick={e => togglePin(e, session.id)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors"
                          style={{ color: sb.text }}
                        >
                          {pinnedSessions.includes(session.id)
                            ? <><PinOff size={15} aria-hidden="true" style={{ color: sb.textMuted }} /> Unpin</>
                            : <><Pin    size={15} aria-hidden="true" style={{ color: sb.textMuted }} /> Pin</>
                          }
                        </button>
                        <button onClick={e => { e.stopPropagation(); setShowProjectSubmenu(true); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors"
                          style={{ color: sb.text }}
                        >
                          <FolderPlus size={15} aria-hidden="true" style={{ color: sb.textMuted }} />
                          Add to project
                        </button>
                        <button onClick={e => { e.stopPropagation(); setOpenSessionDropdown(null); handleEditStart(e, session); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors"
                          style={{ color: sb.text }}
                        >
                          <Pencil size={15} aria-hidden="true" style={{ color: sb.textMuted }} />
                          Rename
                        </button>
                        <div className="h-px mx-3 my-1" style={{ background: sb.divider }} />
                        <button onClick={e => { e.stopPropagation(); setOpenSessionDropdown(null); deleteSession(session.id); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 transition-colors hover:text-red-300"
                        >
                          <Trash2 size={15} aria-hidden="true" />
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

  /* ── Section label ── */
  const SectionLabel = ({ children }) => (
    <p className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-1.5 mt-2 select-none" style={{ color: sb.textDim }}>
      {children}
    </p>
  );

  /* ── Profile Dropdown ── */
  const ProfileDropdown = ({ placement = 'above' }) => (
    <AnimatePresence>
      {isProfileDropdownOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={e => { e.stopPropagation(); setIsProfileDropdownOpen(false); }} />
          <motion.div
            initial={{ opacity: 0, y: placement === 'above' ? 8 : -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: placement === 'above' ? 8 : -8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className={cn(
              'absolute z-50 overflow-hidden py-1.5 rounded-2xl',
              placement === 'above'
                ? 'bottom-full left-3 mb-2 w-[calc(100%-24px)]'
                : 'bottom-0 left-full ml-3 w-52'
            )}
            style={{ background: sb.dropdownBg, border: `1px solid ${sb.dropdownBorder}`, boxShadow: sb.shadow }}
            onKeyDown={handleDropdownKeyDown}
          >
            {profileMenuItems.map(({ icon: Icon, label, action }) => (
              <motion.button key={label} whileHover={{ x: 2 }} onClick={action}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors"
                style={{ color: sb.textMuted }}
              >
                <Icon size={14} aria-hidden="true" />{label}
              </motion.button>
            ))}
            <div className="h-px mx-3 my-1" style={{ background: sb.divider }} />
            <motion.button whileHover={{ x: 2 }}
              onClick={e => { e.stopPropagation(); setIsProfileDropdownOpen(false); handleLogout(); }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              <LogOut size={14} aria-hidden="true" /> Log out
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        aria-label="Main navigation"
        initial={false}
        animate={{
          width: isCollapsed && window.innerWidth >= 768 ? 64 : 256,
          x: isMobileOpen || window.innerWidth >= 768 ? 0 : -300,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed md:static inset-y-0 left-0 z-50 flex flex-col shrink-0 overflow-hidden"
        style={{ background: sb.bg, borderRight: `1px solid ${sb.border}` }}
      >
        {/* Top accent glow */}
        <div className="absolute top-0 left-0 right-0 h-28 pointer-events-none" style={{ background: 'var(--sb-top-glow)' }} />

        {isCollapsed ? (
          /* ── COLLAPSED STRIP ── */
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-4 w-full h-full gap-1 relative z-10">
            {/* Logo / expand */}
            <motion.button
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              onClick={() => setIsCollapsed(false)}
              aria-label="Expand sidebar"
              className="h-10 w-10 flex items-center justify-center rounded-xl mb-2"
              style={{ background: sb.gradient }}
            >
              <Bot size={18} aria-hidden="true" className="text-white" />
            </motion.button>

            {/* New chat */}
            <motion.button
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              onClick={() => { if (location.pathname !== '/chat') navigate('/chat', { state: { newChat: true } }); else handleNewChat(); }}
              aria-label="New chat"
              className="h-10 w-10 flex items-center justify-center rounded-xl transition-colors"
              style={{ color: '#818cf8' }}
            >
              <SquarePen size={17} aria-hidden="true" />
            </motion.button>

            {/* Nav icons */}
            {navItems.map(({ to, label, icon: Icon, match }) => (
              <motion.div key={to} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
                <Link to={to} aria-label={label}
                  className={cn('h-10 w-10 flex items-center justify-center rounded-xl transition-colors')}
                  style={match(location.pathname)
                    ? { color: '#818cf8', background: sb.activeBg }
                    : { color: sb.textMuted }
                  }
                >
                  <Icon size={17} aria-hidden="true" />
                </Link>
              </motion.div>
            ))}

            <div className="flex-1" />

            {/* Search */}
            <motion.button
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              onClick={() => setIsSearchModalOpen(true)}
              aria-label="Search conversations"
              className="h-10 w-10 flex items-center justify-center rounded-xl transition-colors"
              style={{ color: sb.textMuted }}
            >
              <Search size={16} aria-hidden="true" />
            </motion.button>

            {/* Avatar */}
            <motion.button
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              onClick={() => setIsProfileDropdownOpen(p => !p)}
              aria-label="Open profile menu"
              aria-expanded={isProfileDropdownOpen}
              className="relative"
            >
              <Avatar size={36} />
              <ProfileDropdown placement="side" />
            </motion.button>
          </motion.div>
        ) : (
          /* ── EXPANDED SIDEBAR ── */
          <div className="flex flex-col h-full relative z-10">

            {/* Header */}
            <div className="flex items-center justify-between px-3.5 pt-4 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl flex items-center justify-center shadow-lg shrink-0" style={{ background: sb.gradient }}>
                  <Bot size={16} aria-hidden="true" className="text-white" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[14.5px]" style={{ color: sb.text }}>Chatbot</span>
                  <span className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded-md uppercase tracking-wide" style={{ background: sb.gradient }}>Pro</span>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setIsSearchModalOpen(true)}
                  aria-label="Search conversations"
                  className="h-8 w-8 flex items-center justify-center rounded-lg transition-colors"
                  style={{ color: sb.textMuted }}
                  onMouseEnter={e => e.currentTarget.style.background = sb.hover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Search size={15} aria-hidden="true" />
                </button>
                <button
                  onClick={() => setIsCollapsed(true)}
                  aria-label="Collapse sidebar"
                  className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                  style={{ color: sb.textMuted }}
                  onMouseEnter={e => e.currentTarget.style.background = sb.hover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <PanelLeftClose size={15} aria-hidden="true" />
                </button>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  aria-label="Close sidebar"
                  className="md:hidden h-8 w-8 flex items-center justify-center rounded-lg transition-colors"
                  style={{ color: sb.textMuted }}
                >
                  <X size={15} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* New Chat button */}
            <div className="px-3 pb-1 shrink-0">
              <button
                onClick={() => {
                  if (location.pathname !== '/chat') navigate('/chat', { state: { newChat: true } });
                  else handleNewChat();
                  if (window.innerWidth < 768) setIsMobileOpen(false);
                }}
                aria-label="Start new chat"
                className="w-full h-10 flex items-center gap-3 px-3 rounded-xl text-[13px] font-medium transition-colors"
                style={{ background: sb.activeBg, border: `1px solid ${sb.activeBorder}` }}
                onMouseEnter={e => { e.currentTarget.style.background = sb.hover; }}
                onMouseLeave={e => { e.currentTarget.style.background = sb.activeBg; }}
              >
                <SquarePen size={15} aria-hidden="true" style={{ color: '#818cf8' }} />
                <span style={{ color: sb.text }}>New Chat</span>
                <span className="ml-auto text-[10px] font-normal opacity-40" style={{ color: sb.textMuted }}>Ctrl+N</span>
              </button>
            </div>

            {/* Nav links */}
            <nav aria-label="App navigation" className="px-3 pb-1 shrink-0 flex flex-col gap-0.5">
              {navItems.map(({ to, label, icon: Icon, match }, i) => {
                const isActive = match(location.pathname);
                return (
                  <motion.div key={to} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                    <Link
                      to={to}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => window.innerWidth < 768 && setIsMobileOpen(false)}
                      className="w-full h-9 flex items-center gap-3 px-3 rounded-xl text-[13px] font-medium transition-colors relative group"
                      style={{ color: isActive ? sb.text : sb.textMuted }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-xl"
                          style={{ background: sb.activeBg, border: `1px solid ${sb.activeBorder}` }}
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                      <Icon size={15} aria-hidden="true" className="shrink-0 relative z-10" style={{ color: isActive ? '#818cf8' : sb.textMuted }} />
                      <span className="relative z-10">{label}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Divider */}
            <div className="mx-3.5 my-2 h-px shrink-0" style={{ background: sb.divider }} />

            {/* Chat history */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-2">
              <AnimatePresence>
                {pinnedSessionsList.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-2">
                    <SectionLabel>Pinned</SectionLabel>
                    {pinnedSessionsList.map((session, i) => (
                      <motion.div key={session.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                        {renderSession(session, true)}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {groups.today.length > 0 && (
                <div className="mb-2">
                  <SectionLabel>Today</SectionLabel>
                  {groups.today.map((s, i) => (
                    <motion.div key={s.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                      {renderSession(s)}
                    </motion.div>
                  ))}
                </div>
              )}

              {groups.prev7.length > 0 && (
                <div className="mb-2">
                  <SectionLabel>Previous 7 days</SectionLabel>
                  {groups.prev7.map((s, i) => (
                    <motion.div key={s.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                      {renderSession(s)}
                    </motion.div>
                  ))}
                </div>
              )}

              {groups.older.length > 0 && (
                <div className="mb-2">
                  <SectionLabel>Older</SectionLabel>
                  {groups.older.map((s, i) => (
                    <motion.div key={s.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                      {renderSession(s)}
                    </motion.div>
                  ))}
                </div>
              )}

              {unpinnedSessionsList.length === 0 && pinnedSessionsList.length === 0 && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-2 text-xs mt-3" style={{ color: sb.textDim }}>
                  No chats yet. Start a new conversation.
                </motion.p>
              )}
            </div>

            {/* Bottom profile */}
            <div className="shrink-0 px-3 py-3 relative" style={{ borderTop: `1px solid ${sb.divider}` }}>
              <motion.button
                whileHover={{ backgroundColor: sb.hover }}
                onClick={() => setIsProfileDropdownOpen(p => !p)}
                aria-label="Open profile menu"
                aria-expanded={isProfileDropdownOpen}
                className="w-full flex items-center gap-2.5 cursor-pointer p-2 rounded-xl transition-colors group text-left"
              >
                <Avatar size={32} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate leading-tight" style={{ color: sb.text }}>
                    {userProfile?.full_name || userProfile?.username || 'User'}
                  </p>
                  <p className="text-[11px] truncate mt-0.5" style={{ color: sb.textDim }}>
                    {userProfile?.email || 'Free plan'}
                  </p>
                </div>
                <MoreHorizontal size={15} aria-hidden="true" className="opacity-0 group-hover:opacity-60 transition-opacity shrink-0" style={{ color: sb.textMuted }} />
              </motion.button>

              <ProfileDropdown placement="above" />
            </div>
          </div>
        )}

        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} initialTab={settingsInitialTab} />
        <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
        <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
      </motion.aside>
    </>
  );
};
