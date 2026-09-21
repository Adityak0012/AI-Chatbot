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

        {/* 2×2 card grid */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-[600px]">
          {CREATE_CARDS.map(({ icon: Icon, title, description }) => (
            <button
              key={title}
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
