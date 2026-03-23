import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, X, Trash2, Edit2 } from 'lucide-react';
import { useGoals } from '../context/GoalContext';
import { useTasks } from '../context/TaskContext';
import ProgressRing from '../components/ProgressRing';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

export default function Goals() {
  const { goals, addGoal, editGoal, deleteGoal } = useGoals();
  const { tasks } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    deadline: '',
    color: '#3b82f6'
  });

  const openForm = (goal = null) => {
    if (goal) {
      setEditingGoal(goal);
      setForm(goal);
    } else {
      setEditingGoal(null);
      setForm({ title: '', description: '', deadline: '', color: '#3b82f6' });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    
    if (editingGoal) {
      editGoal(editingGoal.id, form);
    } else {
      addGoal(form);
    }
    setIsModalOpen(false);
  };

  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
    '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899'
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            Goals
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Track your long-term ambitions and milestones.
          </p>
        </div>
        <button
          onClick={() => openForm()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Goal</span>
          <span className="sm:hidden">New</span>
        </button>
      </motion.div>

      {/* Grid */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map(goal => {
          // Calculate progress based on tasks
          const linkedTasks = tasks.filter(t => t.goalId === goal.id);
          const totalLinked = linkedTasks.length;
          const completedLinked = linkedTasks.filter(t => t.completed).length;
          const progress = totalLinked === 0 ? 0 : Math.round((completedLinked / totalLinked) * 100);

          return (
            <motion.div key={goal.id} className="glass-card p-5 relative group overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full opacity-70" style={{ backgroundColor: goal.color }} />
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 pr-4">
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1 leading-tight">{goal.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] line-clamp-2">{goal.description || 'No description'}</p>
                </div>
                <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
                  <ProgressRing radius={28} stroke={4} progress={progress} color={goal.color} />
                  <span className="absolute text-xs font-bold text-[var(--text-primary)]">{progress}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[var(--bg-hover)] text-[var(--text-secondary)] flex items-center gap-1.5">
                  <Target className="w-3 h-3" />
                  {completedLinked}/{totalLinked} tasks
                </span>
                {goal.deadline && (
                  <span className="text-xs text-[var(--text-muted)]">
                    Due: {new Date(goal.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--bg-card)] rounded-lg shadow-sm border border-[var(--border-color)] flex overflow-hidden">
                <button 
                  onClick={() => openForm(goal)}
                  className="p-1.5 text-[var(--text-muted)] hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <div className="w-[1px] bg-[var(--border-color)]" />
                <button 
                  onClick={() => deleteGoal(goal.id)}
                  className="p-1.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {goals.length === 0 && (
        <motion.div variants={item} className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-hover)] flex items-center justify-center mx-auto mb-4 text-[var(--accent)]">
            <Target className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">No goals yet</h3>
          <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto mb-6">
            Set big milestones and link your daily tasks to them to track your progress automatically.
          </p>
          <button onClick={() => openForm()} className="btn-primary.inline-flex">
            Create First Goal
          </button>
        </motion.div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border-color)] overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  {editingGoal ? 'Edit Goal' : 'New Goal'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Goal Title *</label>
                  <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field" autoFocus required placeholder="e.g., Launch New Project" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Description</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field resize-none" rows={3} placeholder="Why is this important?" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Deadline</label>
                  <input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Theme Color</label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm({...form, color: c})}
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${form.color === c ? 'scale-110 border-white shadow-md' : 'border-transparent scale-100'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-[var(--border-color)] mt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">{editingGoal ? 'Save Changes' : 'Create Goal'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
