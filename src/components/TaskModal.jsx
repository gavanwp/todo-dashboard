import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Pencil } from 'lucide-react';
import { CATEGORIES } from '../utils';

const overlay = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const modal = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

const defaultForm = {
  title: '',
  description: '',
  priority: 'medium',
  category: 'work',
  dueDate: '',
  dueTime: '',
};

export default function TaskModal({ isOpen, onClose, onSave, editTask }) {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (editTask) {
      setForm({
        title: editTask.title || '',
        description: editTask.description || '',
        priority: editTask.priority || 'medium',
        category: editTask.category || 'work',
        dueDate: editTask.dueDate || '',
        dueTime: editTask.dueTime || '',
        timeBlockStart: editTask.timeBlockStart,
        timeBlockEnd: editTask.timeBlockEnd,
      });
    } else {
      setForm(defaultForm);
    }
  }, [editTask, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
    });
    onClose();
  };

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            {...overlay}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            {...modal}
            className="relative w-full max-w-md bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border-color)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                {editTask ? (
                  <Pencil className="w-4 h-4 text-[var(--accent)]" />
                ) : (
                  <Plus className="w-4 h-4 text-[var(--accent)]" />
                )}
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  {editTask ? 'Edit Task' : 'New Task'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={handleChange('title')}
                  placeholder="What needs to be done?"
                  className="input-field"
                  autoFocus
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={handleChange('description')}
                  placeholder="Add details..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              {/* Priority & Category row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={handleChange('priority')}
                    className="input-field"
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={handleChange('category')}
                    className="input-field"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date & Time row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={handleChange('dueDate')}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                    Due Time
                  </label>
                  <input
                    type="time"
                    value={form.dueTime}
                    onChange={handleChange('dueTime')}
                    className="input-field"
                    disabled={form.timeBlockStart !== undefined && form.timeBlockStart !== null}
                    title={form.timeBlockStart !== undefined && form.timeBlockStart !== null ? "Time is controlled by the Calendar blocks" : ""}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={onClose} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editTask ? 'Save Changes' : 'Add Task'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
