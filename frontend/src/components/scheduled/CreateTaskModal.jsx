import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Modal } from '../ui/Modal';

const CreateTaskModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    prompt: '',
    cron_expression: '* * * * *',
    timezone: 'UTC',
    is_active: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        prompt: initialData.prompt,
        cron_expression: initialData.cron_expression,
        timezone: initialData.timezone,
        is_active: initialData.is_active
      });
    } else {
      setFormData({
        title: '',
        prompt: '',
        cron_expression: '0 9 * * *',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        is_active: true
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Scheduled Task" : "Create Scheduled Task"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--text)]">Task Name</label>
          <input 
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--text)] transition-shadow"
            placeholder="e.g., Daily Summary Generator"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--text)]">Prompt / Instructions</label>
          <textarea 
            required
            rows={4}
            value={formData.prompt}
            onChange={(e) => setFormData({...formData, prompt: e.target.value})}
            className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--text)] transition-shadow resize-none"
            placeholder="Tell the AI what to do when this task runs..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text)]">Cron Schedule</label>
            <input 
              type="text"
              required
              value={formData.cron_expression}
              onChange={(e) => setFormData({...formData, cron_expression: e.target.value})}
              className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--text)] transition-shadow font-mono"
              placeholder="* * * * *"
            />
            <p className="text-xs text-[var(--text-secondary)]">Min Hr Day Mon Wk</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text)]">Timezone</label>
            <input 
              type="text"
              required
              value={formData.timezone}
              onChange={(e) => setFormData({...formData, timezone: e.target.value})}
              className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--text)] transition-shadow"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input 
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
            className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
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
            className="px-4 py-2 text-sm font-medium text-white bg-[var(--primary)] hover:bg-opacity-90 rounded-xl transition-colors shadow-sm"
          >
            {initialData ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;
