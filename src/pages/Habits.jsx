import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Plus, X, Trash2, Edit2, Calendar as CalendarIcon, Check } from 'lucide-react';
import { useHabits } from '../context/HabitContext';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

// Generate last 7 days array
const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      dateStr: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      isToday: i === 0
    });
  }
  return days;
};

export default function Habits() {
  const { habits, addHabit, editHabit, deleteHabit, toggleHabitDate } = useHabits();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  
  const [form, setForm] = useState({ title: '', frequency: 'daily' });
  const weekDays = useMemo(() => getLast7Days(), []);

  const openForm = (habit = null) => {
    if (habit) {
      setEditingHabit(habit);
      setForm({ title: habit.title, frequency: habit.frequency || 'daily' });
    } else {
      setEditingHabit(null);
      setForm({ title: '', frequency: 'daily' });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    
    if (editingHabit) {
      editHabit(editingHabit.id, form);
    } else {
      addHabit(form);
    }
    setIsModalOpen(false);
  };

  // Helper to calculate streak
  const calculateStreak = (completedDates) => {
    if (!completedDates || completedDates.length === 0) return 0;
    
    const sortedDates = [...completedDates].sort((a,b) => new Date(b) - new Date(a));
    let streak = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check if either today or yesterday is completed to keep streak alive
    if (!sortedDates.includes(todayStr) && !sortedDates.includes(yesterdayStr)) {
      return 0; // streak broken
    }

    let currentDate = new Date(sortedDates[0]); // start from latest
    
    for (let i = 0; i < sortedDates.length; i++) {
        const dateStr = sortedDates[i];
        
        // If it's the expected date in sequence
        if (dateStr === currentDate.toISOString().split('T')[0]) {
            streak++;
            // step back one day
            currentDate.setDate(currentDate.getDate() - 1);
        } else if (new Date(dateStr) < currentDate) {
            // we missed a day
            break;
        }
    }
    return streak;
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            Habits Tracker
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Build consistency with daily repeating habits.
          </p>
        </div>
        <button
          onClick={() => openForm()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Habit</span>
          <span className="sm:hidden">New</span>
        </button>
      </motion.div>

      {/* Habits List / Grid */}
      <motion.div variants={item} className="space-y-4">
        {/* Table Header (Desktop) */}
        {habits.length > 0 && (
          <div className="hidden sm:flex items-center pl-4 pr-16 mb-2">
            <div className="flex-1 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Habit</div>
            <div className="flex items-center gap-6">
              {weekDays.map(day => (
                <div key={day.dateStr} className={`w-8 text-center text-xs font-semibold ${day.isToday ? 'text-[var(--accent)] font-bold' : 'text-[var(--text-muted)]'}`}>
                  {day.dayName.charAt(0)}
                </div>
              ))}
              <div className="w-12 text-center text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Streak</div>
            </div>
          </div>
        )}

        {habits.map(habit => {
           const streak = calculateStreak(habit.completedDates);
           
           return (
            <motion.div key={habit.id} className="glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group relative pr-12">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">{habit.title}</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 capitalize">{habit.frequency} habit</p>
              </div>

              {/* Weekly Checklist Grid */}
              <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-6 mt-2 sm:mt-0">
                {weekDays.map(day => {
                  const isChecked = habit.completedDates?.includes(day.dateStr);
                  return (
                    <div key={day.dateStr} className="flex flex-col items-center gap-1.5">
                      <span className="sm:hidden text-[10px] text-[var(--text-muted)] font-medium">
                        {day.dayName.charAt(0)}
                      </span>
                      <button
                        onClick={() => toggleHabitDate(habit.id, day.dateStr)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          isChecked 
                            ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' 
                            : 'bg-transparent border-2 border-[var(--border-color)] text-transparent hover:border-[var(--text-muted)]'
                        } ${day.isToday && !isChecked ? 'border-dashed border-[var(--accent)] ring-2 ring-[var(--accent)] ring-opacity-20' : ''}`}
                      >
                        {isChecked && <Check className="w-4 h-4" strokeWidth={3} />}
                      </button>
                    </div>
                  );
                })}
                
                {/* Streak Counter */}
                <div className="w-12 flex flex-col items-center justify-center ml-2">
                  <Flame className={`w-5 h-5 ${streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-[var(--text-muted)]'}`} />
                  <span className={`text-xs font-bold mt-1 ${streak > 0 ? 'text-orange-500' : 'text-[var(--text-muted)]'}`}>
                    {streak}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="absolute top-1/2 -translate-y-1/2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--bg-card)] rounded-lg shadow-sm border border-[var(--border-color)] flex flex-col overflow-hidden">
                <button 
                  onClick={() => openForm(habit)}
                  className="p-1.5 text-[var(--text-muted)] hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <div className="h-[1px] bg-[var(--border-color)]" />
                <button 
                  onClick={() => deleteHabit(habit.id)}
                  className="p-1.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
           );
        })}
      </motion.div>

      {habits.length === 0 && (
        <motion.div variants={item} className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-hover)] flex items-center justify-center mx-auto mb-4 text-[var(--accent)]">
            <CalendarIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Build Positive Habits</h3>
          <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto mb-6">
            Track your daily routines and build a streak. Consistency is key!
          </p>
          <button onClick={() => openForm()} className="btn-primary.inline-flex">
            Add First Habit
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
              className="relative w-full max-w-sm bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border-color)] overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  {editingHabit ? 'Edit Habit' : 'New Habit'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Habit Title *</label>
                  <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field" autoFocus required placeholder="e.g., Read for 30 minutes" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Frequency</label>
                  <select value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value})} className="input-field">
                    <option value="daily">Daily</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-[var(--border-color)] mt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">{editingHabit ? 'Save Changes' : 'Add Habit'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
