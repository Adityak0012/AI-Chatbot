import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Bot, User, Copy, Check, ThumbsUp, ThumbsDown, RefreshCw, Share2, FileText, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { useSettings } from '../../context/SettingsContext';
import { useChat } from '../../context/ChatContext';

const CodeBlock = ({ language, code, ...props }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group/code my-4 rounded-xl overflow-hidden border border-[var(--border)]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a2e] border-b border-[var(--border)]">
        <span className="text-xs font-mono text-[var(--text-secondary)] lowercase tracking-wide">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors px-2 py-1 rounded-md hover:bg-[var(--hover)]"
        >
          {copied ? (
            <>
              <Check size={13} />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        className="!rounded-none !my-0 text-sm"
        {...props}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export const MessageBubble = ({ message, isTyping, index }) => {
  const isAi = message.role === 'ai';
  const isStreaming = message.isStreaming === true;
  if (isAi && !isTyping && !message.content) return null;
  const { fontSize } = useSettings();
  const { regenerateResponse, saveMessage, unsaveMessage } = useChat() || {};
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isSaved, setIsSaved] = useState(!!message.is_saved);

  const handleToggleSave = async () => {
    try {
      if (isSaved) {
        await unsaveMessage(message.id);
      } else {
        await saveMessage(message.id);
      }
      setIsSaved(!isSaved);
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          text: message.content
        });
        showToast('Shared successfully');
      } catch (err) {
        if (err.name !== 'AbortError') {
          navigator.clipboard.writeText(message.content);
          showToast('Response copied to clipboard');
        }
      }
    } else {
      navigator.clipboard.writeText(message.content);
      showToast('Response copied to clipboard');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    if (regenerateResponse && index !== undefined) {
      regenerateResponse(index);
    }
  };

  const handleLike = () => {
    setFeedback(prev => prev === 'like' ? null : 'like');
  };

  const handleDislike = () => {
    setFeedback(prev => prev === 'dislike' ? null : 'dislike');
  };

  const textSizes = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg'
  };

  /* ── Shared markdown renderer ── */
  const markdownComponents = {
    code({node, inline, className, children, ...props}) {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');
      if (!inline && match) {
        return <CodeBlock language={match[1]} code={codeString} {...props} />;
      }
      return (
        <code className="bg-[var(--surface-2)] border border-[var(--border)] rounded px-1.5 py-0.5 font-mono text-sm text-[var(--text)] inline-block" {...props}>
          {children}
        </code>
      );
    },
    img({node, src, ...props}) {
      const fullSrc = src?.startsWith('/')
        ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${src}`
        : src;
      if (!fullSrc) return null;
      return <img {...props} src={fullSrc} className="max-w-full md:max-w-md rounded-xl shadow-md my-4 border border-[var(--border)]" alt={props.alt || 'Attached Image'} loading="lazy" />;
    },
    a({node, href, children, ...props}) {
      const isUpload = href?.includes('/static/uploads/');
      const hasEmoji = typeof children === 'string' ? children.startsWith('📄 ') : Array.isArray(children) && typeof children[0] === 'string' && children[0].startsWith('📄 ');
      if (isUpload || hasEmoji) {
        const fullHref = href?.startsWith('/') ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${href}` : href;
        let displayText = children;
        if (typeof children === 'string') displayText = children.replace('📄 ', '');
        else if (Array.isArray(children) && typeof children[0] === 'string') displayText = [children[0].replace('📄 ', ''), ...children.slice(1)];
        return (
          <a href={fullHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 my-2 bg-[var(--surface-2)] hover:bg-[var(--hover)] border border-[var(--border)] rounded-xl text-sm !text-[var(--text)] font-medium transition-colors no-underline shadow-sm w-fit" {...props}>
            <FileText size={16} className="!text-[var(--primary)] flex-shrink-0" />
            <span className="truncate max-w-[200px] sm:max-w-[300px]">{displayText}</span>
          </a>
        );
      }
      return <a href={href} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline" {...props}>{children}</a>;
    },
  };

  if (!isAi) {
    /* ── User message: light gray pill, right-aligned ── */
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="w-full flex justify-end py-1.5"
      >
        <div
          className={cn("max-w-[75%] px-4 py-2.5 rounded-2xl rounded-tr-sm text-[var(--text)] break-words", textSizes[fontSize] || "text-[15px]")}
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', boxShadow: '0 1px 4px var(--shadow)' }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {message.content}
          </ReactMarkdown>
        </div>
      </motion.div>
    );
  }

  /* ── AI message: bot icon left + plain prose, no bubble ── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="group w-full flex items-start gap-3 py-2 md:py-2.5"
    >
      {/* Bot icon */}
      <div className="shrink-0 mt-1 w-9 h-9 rounded-full flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', boxShadow: '0 2px 8px rgba(99,102,241,0.25)' }}>
        <Bot size={17} aria-hidden="true" className="text-white" />
      </div>

      {/* Content */}
      <div className={cn("flex-1 min-w-0 flex flex-col", textSizes[fontSize] || "text-[15px]")}>
{isTyping ? (
          <div className="flex flex-col gap-3 py-2 w-full max-w-xs" aria-label="AI is thinking" role="status">
            <div className="flex items-center gap-2 mb-1">
              <motion.span
                className="text-xs font-medium"
                style={{ color: 'var(--text-secondary)' }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              >
                Thinking...
              </motion.span>
            </div>
            {['88%', '72%', '55%'].map((w, i) => (
              <motion.div
                key={i}
                className="h-2.5 rounded-full"
                style={{ width: w, background: 'var(--surface-2)' }}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.2, ease: 'easeInOut' }}
              />
            ))}
          </div>
        ) : (
          <>
            {isStreaming ? (
              <div className="prose prose-headings:text-[var(--text)] prose-p:text-[var(--text)] prose-strong:text-[var(--text)] prose-a:text-[var(--primary)] prose-code:text-[var(--text)] prose-ul:text-[var(--text)] prose-ol:text-[var(--text)] prose-li:text-[var(--text)] prose-blockquote:text-[var(--text-secondary)] prose-blockquote:border-l-0 prose-table:text-[var(--text)] prose-th:text-[var(--text)] prose-td:text-[var(--text)] leading-7 prose-p:leading-7 prose-li:leading-7 prose-headings:font-semibold prose-headings:mt-5 prose-headings:mb-2 prose-p:mt-0 [&>*:first-child]:mt-0 max-w-none break-words text-[var(--text)]">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {message.content}
                </ReactMarkdown>
                <motion.span
                  className="inline-block w-[2px] h-[1em] bg-[var(--text)] ml-0.5 align-middle"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                />
              </div>
            ) : (
              <div className="prose prose-headings:text-[var(--text)] prose-p:text-[var(--text)] prose-strong:text-[var(--text)] prose-a:text-[var(--primary)] prose-code:text-[var(--text)] prose-ul:text-[var(--text)] prose-ol:text-[var(--text)] prose-li:text-[var(--text)] prose-blockquote:text-[var(--text-secondary)] prose-blockquote:border-l-0 prose-table:text-[var(--text)] prose-th:text-[var(--text)] prose-td:text-[var(--text)] leading-7 prose-p:leading-7 prose-li:leading-7 prose-headings:font-semibold prose-headings:mt-5 prose-headings:mb-2 prose-p:mt-0 [&>*:first-child]:mt-0 max-w-none break-words text-[var(--text)]">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {message.content}
                </ReactMarkdown>
              </div>
            )}

            <div className="flex items-center gap-0.5 mt-3 pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150" role="toolbar" aria-label="Message actions"
>
              <button onClick={handleCopy} aria-label={copied ? 'Copied' : 'Copy message'} className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text)] rounded-lg hover:bg-[var(--hover)] transition-colors">
                {copied ? <Check size={14} aria-hidden="true" className="text-green-500" /> : <Copy size={14} aria-hidden="true" />}
              </button>
              <button onClick={handleToggleSave} aria-label={isSaved ? 'Unsave' : 'Save'} className={cn('p-1.5 rounded-lg hover:bg-[var(--hover)] transition-colors', isSaved ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text)]')}>
                <Bookmark size={14} aria-hidden="true" className={isSaved ? 'fill-current' : ''} />
              </button>
              <button onClick={handleRegenerate} aria-label="Regenerate response" className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text)] rounded-lg hover:bg-[var(--hover)] transition-colors">
                <RefreshCw size={14} aria-hidden="true" />
              </button>
              <button onClick={handleLike} aria-label="Good response" aria-pressed={feedback === 'like'} className={cn('p-1.5 rounded-lg hover:bg-[var(--hover)] transition-colors', feedback === 'like' ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text)]')}>
                <ThumbsUp size={14} aria-hidden="true" className={feedback === 'like' ? 'fill-current' : ''} />
              </button>
              <button onClick={handleDislike} aria-label="Bad response" aria-pressed={feedback === 'dislike'} className={cn('p-1.5 rounded-lg hover:bg-[var(--hover)] transition-colors', feedback === 'dislike' ? 'text-red-500' : 'text-[var(--text-secondary)] hover:text-red-500')}>
                <ThumbsDown size={14} aria-hidden="true" className={feedback === 'dislike' ? 'fill-current' : ''} />
              </button>
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-[var(--surface-2)] text-[var(--text)] px-4 py-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[var(--border)] text-sm z-50 whitespace-nowrap"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

