import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, Square, X, FileText, ChevronUp, ChevronRight, ChevronLeft, Check, Pencil, BookOpen, Image, AlignLeft, Plus as PlusIcon, Sparkles } from 'lucide-react';
import { useAutoResizeTextArea } from '../../hooks/useAutoResizeTextArea';
import { useSpeechToText } from '../../hooks/useSpeechToText';
import { cn } from '../../utils/cn';
import { AttachmentMenu } from '../ui/AttachmentMenu';
import { useChat } from '../../context/ChatContext';

export const ChatInput = ({ onSend, isSending, currentSessionId }) => {
  const { messages } = useChat() || {};
  const [input, setInput] = useState('');
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [effort, setEffort] = useState(() => localStorage.getItem('chat_effort') || 'medium');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [menuView, setMenuView] = useState('main');
  const [activeSkill, setActiveSkill] = useState(() => localStorage.getItem('chat_skill') || null);
  const [webSearchOn, setWebSearchOn] = useState(false);

  useEffect(() => {
    if (activeSkill) {
      localStorage.setItem('chat_skill', activeSkill);
    } else {
      localStorage.removeItem('chat_skill');
    }
  }, [activeSkill]);

  const textAreaRef = useAutoResizeTextArea(input);

  const EFFORT_OPTIONS = [
    { id: 'low', label: 'Low', description: 'Short, quick answers' },
    { id: 'medium', label: 'Medium', description: 'Balanced (default)' },
    { id: 'high', label: 'High', description: 'Thorough, detailed answers' },
  ];

  const handleSelectEffort = (id) => {
    setEffort(id);
    localStorage.setItem('chat_effort', id);
    setMenuView('main');
  };

  const MODEL_OPTIONS = [
    { id: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B', description: 'Flagship, best quality (default)' },
    { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B', description: 'Large, versatile' },
    { id: 'openai/gpt-oss-20b', label: 'GPT-OSS 20B', description: 'Smaller, faster' },
    { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B', description: 'Fastest, lightweight' },
  ];

  const [model, setModel] = useState(() => localStorage.getItem('chat_model') || MODEL_OPTIONS[0].id);

  const handleSelectModel = (id) => {
    setModel(id);
    localStorage.setItem('chat_model', id);
    setIsPickerOpen(false);
    setMenuView('main');
  };

  const currentModelOption = MODEL_OPTIONS.find(m => m.id === model) || MODEL_OPTIONS[0];
  const currentEffortOption = EFFORT_OPTIONS.find(e => e.id === effort) || EFFORT_OPTIONS[1];

  // Holds the text that existed before the current speech segment started,
  // so live (interim) words can be shown without being lost or duplicated.
  const baseTextRef = useRef('');

  const handleTranscript = useCallback(({ final, interim }) => {
    if (final) {
      baseTextRef.current = baseTextRef.current
        ? baseTextRef.current + ' ' + final
        : final;
      setInput(baseTextRef.current);
    } else if (interim) {
      setInput(
        baseTextRef.current
          ? baseTextRef.current + ' ' + interim
          : interim
      );
    }
  }, []);

  const { isListening, supported, toggleListening } = useSpeechToText(handleTranscript);

  // Capture whatever was already typed the moment listening starts, so
  // speech gets appended to it instead of overwriting it.
  useEffect(() => {
    if (isListening) {
      baseTextRef.current = input;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening]);

  const handleSend = () => {
    if ((!input.trim() && files.length === 0) || isSending) return;
    const hasImages = files.some(f => f.type.startsWith('image/'));
    const modelToSend = hasImages ? null : model;
    onSend(input, files, effort, modelToSend, null, activeSkill, webSearchOn);
    setInput('');
    setFiles([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  };

  const [fileError, setFileError] = useState('');

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const validateAndAddFiles = (newFiles) => {
    setFileError('');
    const valid = [];
    for (const file of newFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setFileError(`File type not supported: ${file.name}`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setFileError(`File too large (max 10MB): ${file.name}`);
        continue;
      }
      valid.push(file);
    }
    if (valid.length > 0) {
      setFiles(prev => [...prev, ...valid]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handlePaste = (e) => {
    if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
      validateAndAddFiles(Array.from(e.clipboardData.files));
    }
  };

  return (
    <div
      className="relative w-full max-w-3xl mx-auto px-4 pt-2 pb-4 flex flex-col"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={cn(
        "chat-input-box relative flex flex-col bg-[var(--surface)] rounded-2xl border transition-all duration-200",
        "shadow-[0_1px_4px_var(--shadow)] focus-within:shadow-[0_0_0_2px_rgba(0,0,0,0.08)]",
        "focus-within:border-[#111111]",
        isDragging ? "border-[var(--primary)] border-dashed border-2 bg-[var(--primary)]/5" : "border-[#e5e7eb]"
      )}>
        {fileError && (
          <div className="px-4 pt-2 pb-0">
            <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {fileError}
            </div>
          </div>
        )}
        {isDragging && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--surface)]/90 rounded-2xl pointer-events-none">
            <p className="text-sm font-medium text-[var(--primary)]">Drop files to attach</p>
          </div>
        )}

        {/* Image Preview Strip */}
        {files.length > 0 && (
          <div className="flex gap-3 px-4 pt-3 overflow-x-auto custom-scrollbar">
            {files.map((file, index) => (
              <div key={index} className="relative group w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-[var(--border)] shadow-sm flex items-center justify-center bg-[var(--surface-2)]">
                {file.type.startsWith('image/') ? (
                  <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                ) : (
                  <FileText size={24} className="text-[var(--text-secondary)]" />
                )}
                <button
                  onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                  title="Remove file"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea — top zone */}
        <div className="px-4 pt-4 pb-2">
          <textarea
            ref={textAreaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Ask anything..."
            className="w-full max-h-[180px] bg-transparent border-none focus:ring-0 resize-none text-[var(--text)] placeholder-[var(--placeholder)] outline-none text-[15px] leading-relaxed custom-scrollbar"
            rows={3}
            disabled={isSending}
          />
        </div>

        {/* Toolbar — bottom zone */}
        <div className="flex items-center justify-between px-3 pb-3">
          <AttachmentMenu onFilesSelected={(newFiles) => validateAndAddFiles(newFiles)} activeSkill={activeSkill} onSkillChange={setActiveSkill} isWebSearchOn={webSearchOn} onWebSearchToggle={() => setWebSearchOn(prev => !prev)} currentSessionId={currentSessionId} />

          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                onClick={() => { setIsPickerOpen(prev => !prev); setMenuView('main'); }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
                title="Model & effort"
              >
                <Sparkles size={13} aria-hidden="true" />
                <span>Auto</span>
                <ChevronUp size={12} className={cn("transition-transform duration-150", isPickerOpen ? "rotate-180" : "rotate-0")} />
              </button>

              {isPickerOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsPickerOpen(false)} />
                  <div className="absolute bottom-full mb-2 right-0 z-40 w-64 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg p-1.5">
                    {menuView === 'main' && (
                      <>
                        <div className="px-3 py-2.5 flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-[var(--text)]">{currentModelOption.label}</p>
                            <p className="text-xs text-[var(--text-secondary)]">{currentModelOption.description}</p>
                          </div>
                          <Check size={16} className="text-[var(--primary)] mt-0.5 shrink-0" />
                        </div>
                        <div className="h-px bg-[var(--border)] my-1" />
                        <button onClick={() => setMenuView('effort')} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-[var(--text)] hover:bg-[var(--hover)] transition-colors">
                          <span>Effort</span>
                          <span className="flex items-center gap-1 text-[var(--text-secondary)]">{currentEffortOption.label}<ChevronRight size={14} /></span>
                        </button>
                        <button onClick={() => setMenuView('models')} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-[var(--text)] hover:bg-[var(--hover)] transition-colors">
                          <span>More models</span>
                          <ChevronRight size={14} className="text-[var(--text-secondary)]" />
                        </button>
                      </>
                    )}
                    {menuView === 'effort' && (
                      <>
                        <button onClick={() => setMenuView('main')} className="w-full flex items-center gap-1 px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text)]">
                          <ChevronLeft size={14} /> Effort
                        </button>
                        <div className="h-px bg-[var(--border)] my-1" />
                        {EFFORT_OPTIONS.map(opt => (
                          <button key={opt.id} onClick={() => handleSelectEffort(opt.id)}
                            className={cn("w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors",
                              effort === opt.id ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-[var(--text)] hover:bg-[var(--hover)]"
                            )}
                          >
                            <div><p className="text-sm font-medium">{opt.label}</p><p className="text-xs text-[var(--text-secondary)]">{opt.description}</p></div>
                            {effort === opt.id && <Check size={16} />}
                          </button>
                        ))}
                      </>
                    )}
                    {menuView === 'models' && (
                      <>
                        <button onClick={() => setMenuView('main')} className="w-full flex items-center gap-1 px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text)]">
                          <ChevronLeft size={14} /> More models
                        </button>
                        <div className="h-px bg-[var(--border)] my-1" />
                        {MODEL_OPTIONS.map(opt => (
                          <button key={opt.id} onClick={() => handleSelectModel(opt.id)}
                            className={cn("w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors",
                              model === opt.id ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-[var(--text)] hover:bg-[var(--hover)]"
                            )}
                          >
                            <div><p className="text-sm font-medium">{opt.label}</p><p className="text-xs text-[var(--text-secondary)]">{opt.description}</p></div>
                            {model === opt.id && <Check size={16} />}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {supported && (
              <button
                onClick={toggleListening}
                className={cn("p-2 rounded-xl transition-colors",
                  isListening ? "bg-red-500/10 text-red-500 animate-pulse" : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]"
                )}
                title={isListening ? "Stop listening" : "Use microphone"}
              >
                <Mic size={18} />
              </button>
            )}

            {isSending ? (
              <button className="p-2 bg-[var(--border)] text-[var(--text-secondary)] rounded-full" title="Stop generating">
                <Square size={15} fill="currentColor" className="scale-75" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={(!input.trim() && files.length === 0)}
                className={cn("p-2 rounded-full transition-all duration-200 hover:scale-105 active:scale-95",
                  (input.trim() || files.length > 0)
                    ? "bg-[var(--border)] text-[var(--text)] hover:bg-[var(--text-secondary)] hover:text-[var(--bg)]"
                    : "bg-[var(--surface-2)] text-[var(--placeholder)] opacity-50 cursor-not-allowed"
                )}
                title="Send message"
              >
                <Send size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action pills — only shown on empty chat */}
      {(messages || []).length === 0 && (
        <div className="flex flex-wrap gap-2 mt-3 justify-center">
          {[
            { Icon: Pencil,    label: 'Help me write',  prompt: 'Help me write ' },
            { Icon: BookOpen,  label: 'Learn about',    prompt: 'Explain to me: ' },
            { Icon: Image,     label: 'Analyze image',  prompt: 'Analyze this image: ' },
            { Icon: AlignLeft, label: 'Summarize text', prompt: 'Summarize the following: ' },
            { Icon: PlusIcon,  label: 'More',           prompt: null },
          ].map(({ Icon, label, prompt }) => (
            <button
              key={label}
              onClick={() => { if (prompt) { setInput(prompt); textAreaRef.current?.focus(); } }}
              style={{
                height: 34,
                padding: '0 14px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 500,
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--accent-dark)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'border-color 0.15s, color 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-dark)'; e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--accent-dark)'; }}
            >
              <Icon size={13} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      )}

      {(() => {
        const totalChars = (messages || []).reduce((sum, m) => sum + (m.content?.length || 0), 0);
        const totalTokens = Math.ceil(totalChars / 4);
        const inputTokens = Math.ceil(input.length / 4);
        return (
          <div className="text-center mt-3 text-xs flex items-center justify-center gap-2 flex-wrap" style={{ color: 'var(--accent-dark)' }}>
            <span>Chatbot App is AI and can make mistakes. Check important information.</span>
            <div className="flex items-center gap-1.5">
              {input.length > 0 && (
                <span className="flex items-center gap-1 text-[10px] text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded-full border border-[var(--primary)]/20" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  ~{inputTokens} tokens
                </span>
              )}
              {totalTokens > 0 && (
                <span className="flex items-center gap-1 text-[10px] text-[var(--placeholder)] bg-[var(--surface-2)] px-2 py-0.5 rounded-full border border-[var(--border)]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  ~{totalTokens.toLocaleString()} tokens
                </span>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
