import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Code2, Brain, Palette, LineChart, Globe, BookOpen,
  Briefcase, FlaskConical, Music, Camera, Heart, Zap, MessageSquare,
  Search, Star, ArrowRight, Play, Cpu, Shield, Lightbulb, Layers
} from 'lucide-react';

const categories = [
  { id: 'all', label: 'All' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'coding', label: 'Coding' },
  { id: 'creative', label: 'Creative' },
  { id: 'research', label: 'Research' },
  { id: 'business', label: 'Business' },
  { id: 'learning', label: 'Learning' },
];

const agents = [
  {
    id: 1,
    category: 'coding',
    icon: Code2,
    gradient: 'from-blue-500 to-cyan-400',
    glow: 'rgba(59,130,246,0.3)',
    name: 'Code Assistant',
    tagline: 'Full-stack dev partner',
    description: 'Write, debug, review and explain code in any language. Supports React, Python, Node, SQL and more.',
    tags: ['JavaScript', 'Python', 'React', 'SQL'],
    uses: '2.4M',
    rating: 4.9,
    prompts: [
      'Review my React component for bugs',
      'Write a REST API in Node.js',
      'Explain this Python code',
      'Optimize this SQL query',
    ],
  },
  {
    id: 2,
    category: 'creative',
    icon: Palette,
    gradient: 'from-purple-500 to-pink-400',
    glow: 'rgba(168,85,247,0.3)',
    name: 'Creative Writer',
    tagline: 'Stories, scripts & copy',
    description: 'Craft compelling stories, screenplays, marketing copy, poems and creative content of any kind.',
    tags: ['Stories', 'Scripts', 'Poetry', 'Copy'],
    uses: '1.8M',
    rating: 4.8,
    prompts: [
      'Write a short story about time travel',
      'Create a product launch email',
      'Write a poem about the ocean',
      'Draft a compelling bio for LinkedIn',
    ],
  },
  {
    id: 3,
    category: 'research',
    icon: Brain,
    gradient: 'from-indigo-500 to-violet-400',
    glow: 'rgba(99,102,241,0.3)',
    name: 'Research Analyst',
    tagline: 'Deep insights on any topic',
    description: 'Summarize papers, analyze data, compare concepts and extract insights from complex information.',
    tags: ['Analysis', 'Summaries', 'Reports', 'Data'],
    uses: '1.2M',
    rating: 4.7,
    prompts: [
      'Summarize the latest AI research',
      'Compare GPT-4 vs Claude vs Gemini',
      'Explain quantum computing simply',
      'Analyze this market trend',
    ],
  },
  {
    id: 4,
    category: 'productivity',
    icon: Zap,
    gradient: 'from-amber-500 to-orange-400',
    glow: 'rgba(245,158,11,0.3)',
    name: 'Productivity Pro',
    tagline: 'Do more in less time',
    description: 'Plan projects, write emails, create summaries, build to-do systems and manage your workflow.',
    tags: ['Planning', 'Emails', 'Summaries', 'Tasks'],
    uses: '3.1M',
    rating: 4.9,
    prompts: [
      'Create a weekly work plan',
      'Write a professional email',
      'Summarize this meeting transcript',
      'Build a task priority system',
    ],
  },
  {
    id: 5,
    category: 'business',
    icon: LineChart,
    gradient: 'from-green-500 to-teal-400',
    glow: 'rgba(16,185,129,0.3)',
    name: 'Business Strategist',
    tagline: 'Strategy & growth advisor',
    description: 'Get help with business plans, market analysis, pitch decks, competitive research and strategy.',
    tags: ['Strategy', 'Pitch', 'Market', 'Growth'],
    uses: '980K',
    rating: 4.8,
    prompts: [
      'Write a business plan for my startup',
      'Create a SWOT analysis',
      'Build a pitch deck outline',
      'Analyze my competitors',
    ],
  },
  {
    id: 6,
    category: 'learning',
    icon: BookOpen,
    gradient: 'from-rose-500 to-pink-400',
    glow: 'rgba(244,63,94,0.3)',
    name: 'Personal Tutor',
    tagline: 'Learn anything, fast',
    description: 'Get step-by-step explanations, practice problems, quizzes and personalized learning paths.',
    tags: ['Math', 'Science', 'History', 'Languages'],
    uses: '2.2M',
    rating: 4.9,
    prompts: [
      'Teach me machine learning basics',
      'Explain calculus with examples',
      'Quiz me on world history',
      'Help me learn Spanish fast',
    ],
  },
  {
    id: 7,
    category: 'coding',
    icon: Shield,
    gradient: 'from-slate-500 to-gray-400',
    glow: 'rgba(100,116,139,0.3)',
    name: 'Security Expert',
    tagline: 'Code security & best practices',
    description: 'Review code for vulnerabilities, explain security concepts and suggest secure coding patterns.',
    tags: ['Security', 'Auth', 'Encryption', 'OWASP'],
    uses: '560K',
    rating: 4.7,
    prompts: [
      'Review my auth system for flaws',
      'Explain SQL injection prevention',
      'Audit my API endpoints',
      'Best practices for JWT tokens',
    ],
  },
  {
    id: 8,
    category: 'creative',
    icon: Camera,
    gradient: 'from-fuchsia-500 to-purple-400',
    glow: 'rgba(217,70,239,0.3)',
    name: 'Content Creator',
    tagline: 'Viral content & social media',
    description: 'Create engaging posts, video scripts, captions, hashtag strategies and content calendars.',
    tags: ['Instagram', 'YouTube', 'TikTok', 'Twitter'],
    uses: '1.5M',
    rating: 4.8,
    prompts: [
      'Write a YouTube video script',
      'Create 30 days of Instagram posts',
      'Write viral TikTok hooks',
      'Build a content calendar',
    ],
  },
  {
    id: 9,
    category: 'research',
    icon: Globe,
    gradient: 'from-sky-500 to-blue-400',
    glow: 'rgba(14,165,233,0.3)',
    name: 'Language Translator',
    tagline: '100+ languages, perfect tone',
    description: 'Translate text with cultural context, adapt tone for local audiences and explain idioms.',
    tags: ['Translation', 'Localization', 'Culture', 'Idioms'],
    uses: '890K',
    rating: 4.8,
    prompts: [
      'Translate this to Spanish formally',
      'Localize my app for Japan',
      'Explain this French idiom',
      'Translate preserving tone',
    ],
  },
];

const featured = [
  { icon: Cpu, label: 'AI Agent', desc: 'Autonomous multi-step tasks', gradient: 'from-indigo-600 to-blue-500' },
  { icon: Layers, label: 'Multi-Modal', desc: 'Text, code & analysis', gradient: 'from-purple-600 to-pink-500' },
  { icon: Lightbulb, label: 'Smart Prompts', desc: 'Pre-built expert prompts', gradient: 'from-amber-500 to-orange-500' },
  { icon: Shield, label: 'Private & Safe', desc: 'Your data stays yours', gradient: 'from-green-600 to-teal-500' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 340, damping: 28 } },
};

/* ─── Design tokens (always-dark page) ─── */
const T = {
  bg:          '#0B0D12',
  surface:     'rgba(255,255,255,0.035)',
  surfaceHov:  'rgba(255,255,255,0.065)',
  border:      'rgba(255,255,255,0.07)',
  borderHov:   'rgba(255,255,255,0.14)',
  text:        'rgba(255,255,255,0.92)',
  textMuted:   'rgba(255,255,255,0.42)',
  textDim:     'rgba(255,255,255,0.22)',
  accent:      '#6366f1',
  accentAlpha: 'rgba(99,102,241,0.18)',
  accentBorder:'rgba(99,102,241,0.35)',
  accentText:  '#a5b4fc',
  tagBg:       'rgba(255,255,255,0.05)',
  tagBorder:   'rgba(255,255,255,0.08)',
  tagText:     'rgba(255,255,255,0.38)',
};

export default function Explore() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [hoveredAgent, setHoveredAgent] = useState(null);

  const filtered = agents.filter(a => {
    const matchCat = activeCategory === 'all' || a.category === activeCategory;
    const matchSearch = search === '' ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const handleTryPrompt = (prompt) => {
    navigate('/chat', { state: { newChat: true, initialMessage: prompt } });
  };

  const handleStartAgent = (agent) => {
    navigate('/chat', { state: { newChat: true, initialMessage: `You are ${agent.name}. ${agent.description} Let's begin!` } });
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ background: T.bg }}>

      {/* ── Hero ── */}
      <div className="relative px-6 pt-12 pb-10" style={{ borderBottom: `1px solid ${T.border}` }}>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide mb-5"
            style={{ background: T.accentAlpha, border: `1px solid ${T.accentBorder}`, color: T.accentText }}>
            <Sparkles size={11} aria-hidden="true" />
            Powered by Advanced AI
          </div>

          <h1 className="text-[2.15rem] font-bold leading-[1.18] tracking-tight mb-2.5"
            style={{ color: T.text }}>
            Explore AI Agents
          </h1>
          <p className="text-[0.9375rem] leading-relaxed mb-8" style={{ color: T.textMuted }}>
            Discover specialized AI assistants built for every task — from coding to creativity
          </p>

          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: T.textDim }} aria-hidden="true" />
            <input
              type="text"
              placeholder="Search agents, skills, or topics…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${T.border}`,
                color: T.text,
                caretColor: T.accent,
              }}
              onFocus={e => {
                e.target.style.border = `1px solid ${T.accentBorder}`;
                e.target.style.boxShadow = `0 0 0 3px ${T.accentAlpha}`;
              }}
              onBlur={e => {
                e.target.style.border = `1px solid ${T.border}`;
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.38, ease: 'easeOut' }}
          className="flex flex-wrap justify-center gap-2.5 mt-8 max-w-2xl mx-auto"
        >
          {featured.map((f, i) => (
            <div key={i}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl"
              style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${f.gradient} flex items-center justify-center shrink-0`}>
                <f.icon size={13} className="text-white" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[12px] font-semibold leading-none" style={{ color: T.text }}>{f.label}</p>
                <p className="text-[10px] mt-[3px]" style={{ color: T.textDim }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Category filter ── */}
      <div className="px-6 py-3 sticky top-0 z-20"
        style={{ background: 'rgba(11,13,18,0.88)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderBottom: `1px solid ${T.border}` }}>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide max-w-5xl mx-auto">
          {categories.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="shrink-0 px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150"
                style={isActive ? {
                  background: T.accentAlpha,
                  color: T.accentText,
                  border: `1px solid ${T.accentBorder}`,
                } : {
                  background: 'transparent',
                  color: T.textMuted,
                  border: `1px solid transparent`,
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = T.text; e.currentTarget.style.background = T.surface; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = T.textMuted; e.currentTarget.style.background = 'transparent'; } }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Agent grid ── */}
      <div className="px-6 py-6 max-w-5xl mx-auto">
        <p className="text-[12px] mb-5 font-medium" style={{ color: T.textDim }}>
          {filtered.length} agent{filtered.length !== 1 ? 's' : ''} available
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory + search}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map(agent => {
              const isHovered = hoveredAgent === agent.id;
              return (
                <motion.div
                  key={agent.id}
                  variants={itemVariants}
                  onHoverStart={() => setHoveredAgent(agent.id)}
                  onHoverEnd={() => setHoveredAgent(null)}
                  className="relative flex flex-col rounded-2xl overflow-hidden"
                  style={{
                    background: isHovered ? T.surfaceHov : T.surface,
                    border: `1px solid ${isHovered ? T.borderHov : T.border}`,
                    boxShadow: isHovered ? `0 12px 40px ${agent.glow}` : 'none',
                    transition: 'background 0.18s, border-color 0.18s, box-shadow 0.22s',
                  }}
                >
                  {/* Top accent line on hover */}
                  <div className="absolute top-0 left-0 right-0 h-px transition-opacity duration-300"
                    style={{ background: `linear-gradient(90deg, transparent, ${agent.glow}, transparent)`, opacity: isHovered ? 1 : 0 }} />

                  <div className="p-5 flex flex-col flex-1">
                    {/* Icon + meta row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center shadow-md shrink-0`}>
                        <agent.icon size={18} className="text-white" aria-hidden="true" />
                      </div>
                      <div className="flex items-center gap-1.5 text-right">
                        <Star size={11} style={{ color: '#fbbf24', fill: '#fbbf24' }} aria-hidden="true" />
                        <span className="text-[12px] font-semibold" style={{ color: T.text }}>{agent.rating}</span>
                        <span className="text-[11px]" style={{ color: T.textDim }}>· {agent.uses}</span>
                      </div>
                    </div>

                    {/* Name + tagline */}
                    <h3 className="text-[14px] font-bold leading-snug mb-0.5" style={{ color: T.text }}>{agent.name}</h3>
                    <p className="text-[12px] mb-2.5" style={{ color: T.textMuted }}>{agent.tagline}</p>
                    <p className="text-[12px] leading-[1.6] mb-4" style={{ color: T.textDim }}>{agent.description}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {agent.tags.map(tag => (
                        <span key={tag}
                          className="text-[10px] px-2 py-[3px] rounded-md font-medium"
                          style={{ background: T.tagBg, color: T.tagText, border: `1px solid ${T.tagBorder}` }}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Prompt suggestions */}
                    <div className="space-y-1.5 mb-5 flex-1">
                      {agent.prompts.slice(0, 3).map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => handleTryPrompt(prompt)}
                          className="w-full text-left text-[11.5px] px-3 py-2 rounded-lg flex items-center gap-2 group/p transition-all duration-150"
                          style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.border}`, color: T.textDim }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = T.accentAlpha;
                            e.currentTarget.style.borderColor = T.accentBorder;
                            e.currentTarget.style.color = T.text;
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                            e.currentTarget.style.borderColor = T.border;
                            e.currentTarget.style.color = T.textDim;
                          }}
                        >
                          <MessageSquare size={10} className="shrink-0" aria-hidden="true" />
                          <span className="truncate">{prompt}</span>
                          <ArrowRight size={10} className="ml-auto shrink-0 opacity-0 group-hover/p:opacity-60 transition-opacity" aria-hidden="true" />
                        </button>
                      ))}
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => handleStartAgent(agent)}
                      className="w-full h-9 rounded-xl text-[12.5px] font-semibold text-white flex items-center justify-center gap-1.5 transition-all duration-150"
                      style={{
                        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                        boxShadow: isHovered ? '0 4px 16px rgba(99,102,241,0.4)' : '0 2px 8px rgba(99,102,241,0.25)',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                    >
                      <Play size={11} fill="white" aria-hidden="true" />
                      Start Agent
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Sparkles size={28} className="mx-auto mb-3" style={{ color: T.textDim }} aria-hidden="true" />
            <p className="text-[14px] font-semibold" style={{ color: T.text }}>No agents found</p>
            <p className="text-[13px] mt-1" style={{ color: T.textMuted }}>Try a different search or category</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
