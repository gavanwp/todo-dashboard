import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Plus, ChevronRight } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { format, addDays, startOfDay, isAfter, isSameDay } from 'date-fns';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

export default function Upcoming() {
  const { tasks, addTask, editTask, deleteTask, toggleComplete } = useTasks();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Group tasks by date for next 14 days
  const groupedTasks = useMemo(() => {
    const today = startOfDay(new Date());
    const groups = [];

    for (let i = 1; i <= 14; i++) {
      const date = addDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayTasks = tasks.filter(t => !t.completed && t.dueDate === dateStr);

      if (dayTasks.length > 0) {
        groups.push({
          date,
          dateStr,
          label: i === 1 ? 'Tomorrow' : format(date, 'EEEE, MMM d'),
          tasks: dayTasks,
        });
      }
    }

    // Also add tasks further out
    const twoWeeksOut = addDays(today, 15);
    const laterTasks = tasks.filter(t => {
      if (t.completed || !t.dueDate) return false;
      const taskDate = new Date(t.dueDate);
      return isAfter(taskDate, twoWeeksOut) || isSameDay(taskDate, twoWeeksOut);
    });

    if (laterTasks.length > 0) {
      groups.push({
        date: twoWeeksOut,
        dateStr: 'later',
        label: 'Later',
        tasks: laterTasks,
      });
    }

    return groups;
  }, [tasks]);

  // Tasks without dates
  const undatedTasks = tasks.filter(t => !t.completed && !t.dueDate);
  const totalUpcoming = groupedTasks.reduce((sum, g) => sum + g.tasks.length, 0);

  const handleSave = (formData) => {
    if (editingTask) {
      editTask(editingTask.id, formData);
    } else {
      addTask(formData);
    }
    setEditingTask(null);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <CalendarDays className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white tracking-tight">
              Upcoming
            </h1>
            <p className="text-sm text-surface-500">
              {totalUpcoming} tasks ahead
            </p>
          </div>
        </div>
        <button
          onClick={() => { setEditingTask(null); setModalOpen(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </motion.div>

      {/* Grouped tasks */}
      {groupedTasks.length === 0 && undatedTasks.length === 0 ? (
        <motion.div variants={item} className="text-center py-16">
          <CalendarDays className="w-12 h-12 mx-auto text-surface-300 dark:text-surface-600 mb-3" />
          <p className="text-surface-500 dark:text-surface-500 font-medium">No upcoming tasks</p>
          <p className="text-sm text-surface-400 dark:text-surface-600 mt-1">
            Tasks with future due dates will appear here
          </p>
        </motion.div>
      ) : (
        <>
          {groupedTasks.map((group) => (
            <motion.div key={group.dateStr} variants={item} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <ChevronRight className="w-3.5 h-3.5 text-primary-500" />
                <h2 className="text-sm font-bold text-surface-900 dark:text-white">
                  {group.label}
                </h2>
                <span className="text-xs font-medium text-surface-400 bg-surface-100 dark:bg-dark-hover px-2 py-0.5 rounded-full">
                  {group.tasks.length}
                </span>
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {group.tasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={toggleComplete}
                      onEdit={handleEdit}
                      onDelete={deleteTask}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}

          {undatedTasks.length > 0 && (
            <motion.div variants={item} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <ChevronRight className="w-3.5 h-3.5 text-surface-400" />
                <h2 className="text-sm font-bold text-surface-600 dark:text-surface-400">
                  No Due Date
                </h2>
                <span className="text-xs font-medium text-surface-400 bg-surface-100 dark:bg-dark-hover px-2 py-0.5 rounded-full">
                  {undatedTasks.length}
                </span>
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {undatedTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={toggleComplete}
                      onEdit={handleEdit}
                      onDelete={deleteTask}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </>
      )}

      <TaskModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(null); }}
        onSave={handleSave}
        editTask={editingTask}
      />
    </motion.div>
  );
}
