import React, { useRef } from 'react';
import { FileText, FileQuestion, Code2, Upload, AlignLeft, Languages, Table2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';

const CREATE_CARDS = [
  {
    icon: FileText,
    title: 'Document',
    description: 'Summarize, rewrite, and chat about your documents.',
    prompt: "I have a document I'd like to discuss. Please help me summarize, rewrite, or analyze it. I'll paste the content below:",
  },
  {
    icon: FileQuestion,
    title: 'Ask PDF',
    description: 'Upload a PDF and ask anything about it.',
    prompt: "I'm going to share a PDF with you. Please wait for me to upload it, then answer my questions about it.",
  },
  {
    icon: Code2,
    title: 'Code',
    description: 'Debug, explain, and improve your code.',
    prompt: "I need help with my code. I'll share it below — please debug, explain, or improve it:",
  },
  {
    icon: Upload,
    title: 'Upload Files',
    description: 'Upload files to start chatting.',
    prompt: "I'm uploading a file. Please analyze it and tell me what you find.",
    filePicker: true,
  },
  {
    icon: AlignLeft,
    title: 'Summarize',
    description: 'Get a clear, concise summary of any text.',
    prompt: "Please summarize the following text in a clear, concise way:\n\n",
  },
  {
    icon: Languages,
    title: 'Translate',
    description: 'Translate text into any language.',
    prompt: "Please translate the following text. I'll tell you the target language:\n\n",
  },
  {
    icon: Table2,
    title: 'Spreadsheet',
    description: 'Analyze spreadsheet or CSV data.',
    prompt: "I have a spreadsheet or CSV data I'd like help analyzing. Here it is:\n\n",
  },
  {
    icon: Search,
    title: 'Research',
    description: 'Deep research on any topic.',
    prompt: "Please do a deep research on the following topic and give me a comprehensive overview:\n\n",
  },
];

export default function Documents() {
  const navigate = useNavigate();
  const { handleNewChat } = useChat();
  const fileInputRef = useRef(null);

  const handleCardClick = (card) => {
    if (card.filePicker) {
      fileInputRef.current?.click();
      return;
    }
    handleNewChat();
    navigate('/chat', { state: { newChat: true, initialMessage: card.prompt } });
  };

  const handleFileSelected = () => {
    handleNewChat();
    navigate('/chat', { state: { newChat: true, initialMessage: "I'm uploading a file. Please analyze it and tell me what you find." } });
  };

  return (
    <div className="flex h-full w-full overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-auto">
        {/* Sunburst icon */}
        <div className="mb-6">
          <svg width="32" height="32" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="28" cy="28" r="9" fill="var(--text)" opacity="0.15" />
            <circle cx="28" cy="28" r="5" fill="var(--text)" opacity="0.5" />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
              const r = Math.PI / 180 * deg;
              const x1 = 28 + 11 * Math.cos(r);
              const y1 = 28 + 11 * Math.sin(r);
              const x2 = 28 + (i % 2 === 0 ? 25 : 20) * Math.cos(r);
              const y2 = 28 + (i % 2 === 0 ? 25 : 20) * Math.sin(r);
              return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--text)" strokeWidth={i % 2 === 0 ? 2 : 1.2} strokeLinecap="round" opacity={i % 2 === 0 ? 0.7 : 0.4} />;
            })}
          </svg>
        </div>

        <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--text)' }}>Create something new</h2>

        {/* 2×4 card grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-[900px]">
          {CREATE_CARDS.map(({ icon: Icon, title, description, ...rest }) => (
            <button
              key={title}
              onClick={() => handleCardClick({ icon: Icon, title, description, ...rest })}
              className="flex items-start gap-3 p-4 rounded-xl text-left transition-all duration-200"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#3f3f46';
                e.currentTarget.style.transform = 'scale(1.01)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Icon size={24} style={{ color: 'var(--text)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text)' }}>{title}</p>
                <p className="text-sm leading-snug" style={{ color: 'var(--text-secondary)' }}>{description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
