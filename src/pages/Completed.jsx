import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, RotateCcw, Trash2, Search, X } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { formatDate, PRIORITIES, getCategoryConfig } from '../utils';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

export default function Completed() {
  const { tasks, toggleComplete, deleteTask } = useTasks();
  const [searchQuery, setSearchQuery] = useState('');

  const completedTasks = useMemo(() => {
    let filtered = tasks.filter(t => t.completed);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q)
      );
    }

    // Sort by completedAt descending
    return filtered.sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0));
  }, [tasks, searchQuery]);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              Completed
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              {completedTasks.length} tasks completed
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div variants={item}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search completed tasks..."
            className="input-field pl-9 pr-8"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Task list */}
      {completedTasks.length === 0 ? (
        <motion.div variants={item} className="text-center py-16">
          <CheckCircle2 className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3 opacity-30" />
          <p className="text-[var(--text-secondary)] font-medium">No completed tasks yet</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Tasks you complete will show up here
          </p>
        </motion.div>
      ) : (
        <motion.div variants={item} className="space-y-2">
          <AnimatePresence>
            {completedTasks.map(task => {
              const priority = PRIORITIES[task.priority] || PRIORITIES.low;
              const category = getCategoryConfig(task.category);

              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-card p-4 group"
                >
                  <div className="flex items-center gap-3">
                    {/* Check icon */}
                    <div className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-[var(--text-secondary)] line-through truncate">
                        {task.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${priority.color} opacity-60`} style={{ background: `color-mix(in srgb, currentColor 10%, transparent)` }}>
                          {priority.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium`} style={{ background: `color-mix(in srgb, ${category.color.split(' ')[1].replace('text-', '')} 10%, transparent)`, color: `var(--text-primary)`, opacity: 0.6 }}>
                          {category.label}
                        </span>
                        {task.completedAt && (
                          <span className="text-xs text-[var(--text-muted)]">
                            Completed {formatDate(task.completedAt)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => toggleComplete(task.id)}
                        className="p-1.5 min-w-[44px] min-h-[44px] lg:min-w-0 lg:min-h-0 flex items-center justify-center rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                        title="Restore"
                      >
                        <RotateCcw className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 min-w-[44px] min-h-[44px] lg:min-w-0 lg:min-h-0 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
