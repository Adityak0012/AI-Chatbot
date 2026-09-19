import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, Plus, ChevronDown, Download, FileText, FileDown, Share2, Check, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useChat } from '../../context/ChatContext';
import { SearchModal } from '../ui/SearchModal';
import api from '../../services/api';

export const MainLayout = ({ children }) => {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith('/chat');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showExportMenu, setShowExportMenu]           = useState(false);
  const [shareCopied, setShareCopied]                 = useState(false);
  const [isSearchOpen, setIsSearchOpen]               = useState(false);

  const { handleNewChat, messages, sessions, currentSessionId, userProfile } = useChat();

  const currentSession = sessions?.find(s => s.id === currentSessionId);
  const chatTitle      = currentSession?.title || 'Chat Export';

  const userInitial = userProfile?.username?.charAt(0)?.toUpperCase() || 'A';
  const avatarSrc   = userProfile?.avatar_url ? `${api.defaults.baseURL}${userProfile.avatar_url}` : null;

  const exportAsMarkdown = () => {
    const lines = messages.map(msg => {
      const role = msg.role === 'ai' ? '**AI**' : '**You**';
      return `${role}:\n\n${msg.content}\n\n---\n`;
    });
    const content = `# ${chatTitle}\n\n${lines.join('\n')}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `${chatTitle.replace(/\s+/g, '-')}.md`; a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportAsPDF = () => {
    const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>${chatTitle}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; line-height: 1.6; }
      h1 { font-size: 24px; border-bottom: 2px solid #eee; padding-bottom: 12px; margin-bottom: 24px; }
      .message { margin-bottom: 20px; }
      .role { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
      .role.user { color: #6366f1; } .role.ai { color: #3b82f6; }
      .content { background: #f8f8f8; border-left: 3px solid #3b82f6; padding: 12px 16px; border-radius: 0 8px 8px 0; white-space: pre-wrap; font-size: 14px; word-break: break-word; }
      .content.user { border-left-color: #6366f1; background: #f0f0ff; }
      hr { border: none; border-top: 1px solid #eee; margin: 20px 0; }
    </style>
  </head>
  <body>
    <h1>${chatTitle}</h1>
    ${messages.map(msg => `
      <div class="message">
        <div class="role ${msg.role === 'ai' ? 'ai' : 'user'}">${msg.role === 'ai' ? 'AI Assistant' : 'You'}</div>
        <div class="content ${msg.role === 'ai' ? 'ai' : 'user'}">${msg.content.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
      </div><hr/>
    `).join('')}
  </body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `${chatTitle.replace(/\s+/g, '-')}.html`; a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const shareChat = () => {
    const lines    = messages.map(msg => `${msg.role === 'ai' ? 'AI' : 'You'}: ${msg.content}`).join('\n\n');
    const shareText = `${chatTitle}\n\n${lines}`;
    if (navigator.share) {
      navigator.share({ title: chatTitle, text: shareText }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  return (
    <div className="flex w-screen h-screen bg-[var(--bg)] text-[var(--text)] overflow-hidden font-sans transition-colors duration-300">
      <Sidebar isMobileOpen={isMobileSidebarOpen} setIsMobileOpen={setIsMobileSidebarOpen} />

      <main className="flex-1 flex flex-col h-full min-w-0 bg-[var(--bg)] relative z-10 transition-colors duration-300">

        {/* ── Header Bar ── */}
        <header className="shrink-0 flex items-center justify-between px-4 py-0 bg-[var(--header-bg)] border-b border-[var(--border)] z-20 h-[52px]">

          {/* LEFT */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Open sidebar"
              className="md:hidden p-2 text-[var(--text-secondary)] hover:bg-[var(--hover)] rounded-lg transition-colors"
            >
              <Menu size={20} aria-hidden="true" />
            </button>

            {isChatPage && currentSession && (
              <span className="hidden md:block text-[14px] font-semibold text-[var(--text)] truncate max-w-[240px]" title={chatTitle}>
                {chatTitle}
              </span>
            )}

            {isChatPage && !currentSession && (
              <span className="hidden md:block text-[14px] font-semibold text-[var(--text-secondary)]">
                New Chat
              </span>
            )}
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-1.5">

            {/* Search */}
            {isChatPage && (
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search conversations"
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--placeholder)] text-[13px] cursor-pointer hover:border-[var(--primary)] transition-all w-[200px]"
              >
                <Search size={13} aria-hidden="true" />
                <span>Search conversations…</span>
              </button>
            )}

            {/* Share */}
            {isChatPage && messages.length > 0 && (
              <>
                <button
                  onClick={shareChat}
                  aria-label="Share chat"
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--primary)] text-xs font-medium transition-all"
                >
                  {shareCopied
                    ? <><Check size={13} aria-hidden="true" className="text-green-500" /><span className="text-green-500">Copied</span></>
                    : <><Share2 size={13} aria-hidden="true" />Share</>
                  }
                </button>

                {/* Export */}
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(p => !p)}
                    aria-label="Export chat"
                    aria-expanded={showExportMenu}
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--primary)] text-xs font-medium transition-all"
                  >
                    <Download size={13} aria-hidden="true" />Export
                  </button>
                  {showExportMenu && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowExportMenu(false)} />
                      <div className="absolute right-0 top-10 z-40 w-48 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden">
                        <div className="px-3 py-2 border-b border-[var(--border)]">
                          <p className="text-xs text-[var(--text-secondary)] font-medium">Export chat as</p>
                        </div>
                        <button onClick={exportAsMarkdown} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors">
                          <FileText size={15} aria-hidden="true" className="text-[var(--primary)]" />Markdown (.md)
                        </button>
                        <button onClick={exportAsPDF} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors">
                          <FileDown size={15} aria-hidden="true" className="text-[var(--primary)]" />PDF (.html → print)
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {/* Avatar */}
            <div
              aria-hidden="true"
              className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow cursor-pointer select-none overflow-hidden shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}
            >
              {avatarSrc
                ? <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
                : userInitial
              }
            </div>

            {/* Mobile: new chat */}
            <button
              onClick={handleNewChat}
              aria-label="New chat"
              className="md:hidden p-2 text-[var(--text-secondary)] hover:bg-[var(--hover)] rounded-lg transition-colors"
            >
              <Plus size={20} aria-hidden="true" />
            </button>
          </div>
        </header>

        {children}
      </main>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};
