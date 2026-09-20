import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Modal } from '../ui/Modal';

const REPEAT_OPTIONS = [
  { value: 'daily',   label: 'Daily' },
  { value: 'weekly',  label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'hourly',  label: 'Hourly' },
];

const buildCron = (repeat, time) => {
  const [h, m] = (time || '09:00').split(':').map(Number);
  switch (repeat) {
    case 'hourly':  return '0 * * * *';
    case 'weekly':  return `${m} ${h} * * 1`;
    case 'monthly': return `${m} ${h} 1 * *`;
    case 'daily':
    default:        return `${m} ${h} * * *`;
  }
};

const parseCron = (cron) => {
  if (!cron) return { repeat: 'daily', time: '09:00' };
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return { repeat: 'daily', time: '09:00' };
  const [min, hr, day, , dow] = parts;
  if (hr === '*') return { repeat: 'hourly', time: '00:00' };
  const time = `${String(hr).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  if (dow !== '*') return { repeat: 'weekly', time };
  if (day !== '*') return { repeat: 'monthly', time };
  return { repeat: 'daily', time };
};

const inputClass = "w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--border)] text-[var(--text)] transition-shadow";

const CreateTaskModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [repeat, setRepeat] = useState('daily');
  const [time, setTime] = useState('09:00');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (initialData) {
      const parsed = parseCron(initialData.cron_expression);
      setTitle(initialData.title || '');
      setPrompt(initialData.prompt || '');
      setRepeat(parsed.repeat);
      setTime(parsed.time);
      setIsActive(initialData.is_active);
      setStartDate('');
      setEndDate('');
    } else {
      setTitle('');
      setPrompt('');
      setRepeat('daily');
      setTime('09:00');
      setStartDate('');
      setEndDate('');
      setIsActive(true);
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      title,
      prompt,
      cron_expression: buildCron(repeat, time),
      timezone: 'Asia/Kolkata',
      is_active: isActive,
      ...(startDate ? { start_date: startDate } : {}),
      ...(endDate ? { end_date: endDate } : {}),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Scheduled Task" : "Create Scheduled Task"}>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--text)]">Task Name</label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            className={inputClass}
            placeholder="e.g., Daily Summary Generator"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--text)]">Prompt / Instructions</label>
          <textarea
            required
            rows={4}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            className={`${inputClass} resize-none`}
            placeholder="Tell the AI what to do when this task runs..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text)]">Repeat</label>
            <select
              value={repeat}
              onChange={e => setRepeat(e.target.value)}
              className={inputClass}
            >
              {REPEAT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text)]">Run at</label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              disabled={repeat === 'hourly'}
              className={`${inputClass} ${repeat === 'hourly' ? 'opacity-40 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text)]">Start Date <span className="text-[var(--text-secondary)] font-normal">(optional)</span></label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text)]">End Date <span className="text-[var(--text-secondary)] font-normal">(optional)</span></label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="is_active"
            checked={isActive}
            onChange={e => setIsActive(e.target.checked)}
            className="w-4 h-4 rounded border-[var(--border)]"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-[var(--text)] cursor-pointer">
            Task is active
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[var(--text)] bg-[var(--surface-2)] hover:bg-[var(--hover)] rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors"
            style={{ background: '#111827' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#374151'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#111827'; }}
          >
            {initialData ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;
