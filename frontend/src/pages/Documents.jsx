import React from 'react';
import { FileText, FileQuestion, Code2, Upload } from 'lucide-react';

const CREATE_CARDS = [
  {
    icon: FileText,
    title: 'Document',
    description: 'Summarize, rewrite, and chat about your documents.',
  },
  {
    icon: FileQuestion,
    title: 'Ask PDF',
    description: 'Upload a PDF and ask anything about it.',
  },
  {
    icon: Code2,
    title: 'Code',
    description: 'Debug, explain, and improve your code.',
  },
  {
    icon: Upload,
    title: 'Upload Files',
    description: 'Upload files to start chatting.',
  },
];

export default function Documents() {
  return (
    <div className="flex h-full w-full overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-auto">
        {/* Sunburst icon */}
        <div className="mb-6">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="28" cy="28" r="9" fill="var(--primary)" opacity="0.15" />
            <circle cx="28" cy="28" r="5" fill="var(--primary)" opacity="0.5" />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
              const r = Math.PI / 180 * deg;
              const x1 = 28 + 11 * Math.cos(r);
              const y1 = 28 + 11 * Math.sin(r);
              const x2 = 28 + (i % 2 === 0 ? 25 : 20) * Math.cos(r);
              const y2 = 28 + (i % 2 === 0 ? 25 : 20) * Math.sin(r);
              return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--primary)" strokeWidth={i % 2 === 0 ? 2 : 1.2} strokeLinecap="round" opacity={i % 2 === 0 ? 0.7 : 0.4} />;
            })}
          </svg>
        </div>

        <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text)' }}>Create something new</h2>
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Choose a template to get started</p>

        {/* 2×2 card grid */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-xl">
          {CREATE_CARDS.map(({ icon: Icon, title, description }) => (
            <button
              key={title}
              className="flex items-start gap-3 p-4 rounded-xl border text-left transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
              style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}
            >
              <div
                className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: '#f3f4f6' }}
              >
                <Icon size={18} style={{ color: '#374151' }} />
              </div>
              <div>
                <p className="text-sm font-semibold mb-0.5" style={{ color: '#111827' }}>{title}</p>
                <p className="text-xs leading-snug" style={{ color: '#6b7280' }}>{description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
