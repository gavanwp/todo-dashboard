import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CalendarDays,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import TaskModal from '../components/TaskModal';
import TimeBlockGrid from '../components/TimeBlockGrid';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function Calendar() {
  const { tasks, addTask, editTask, deleteTask, toggleComplete } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setView] = useState('month'); // month | timeblock
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    // Next month days
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    return days;
  }, [year, month]);

  const getTasksForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(t => t.dueDate === dateStr);
  };

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const selectedDateStr = selectedDate
    ? selectedDate.toISOString().split('T')[0]
    : todayStr;

  const selectedTasks = useMemo(() => {
    return tasks.filter(t => t.dueDate === selectedDateStr);
  }, [tasks, selectedDateStr]);

  const navigateMonth = (dir) => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + dir);
      return d;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const handleSave = (formData) => {
    if (editingTask) {
      editTask(editingTask.id, formData);
    } else {
      addTask({ ...formData, dueDate: formData.dueDate || selectedDateStr });
    }
    setEditingTask(null);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <CalendarDays className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              Calendar
            </h1>
            <p className="text-sm text-[var(--text-muted)]">Plan your schedule</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-[var(--bg-hover)] rounded-xl p-1">
            <button
              onClick={() => setView('month')}
              className={`p-2 rounded-lg transition-all text-sm ${
                view === 'month'
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('timeblock')}
              className={`p-2 rounded-lg transition-all text-sm ${
                view === 'timeblock'
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Clock className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => { setEditingTask(null); setModalOpen(true); }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>
      </motion.div>

      {view === 'month' ? (
        <>
          {/* Month navigation */}
          <motion.div variants={item} className="glass-card p-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-center">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  {MONTHS[month]} {year}
                </h2>
              </div>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)] transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={goToToday}
              className="text-xs font-medium text-[var(--accent)] hover:underline mb-3 block mx-auto"
            >
              Go to today
            </button>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAYS.map(d => (
                <div key={d} className="text-center text-xs font-semibold text-[var(--text-muted)] py-2">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((cd, idx) => {
                const dateStr = cd.date.toISOString().split('T')[0];
                const dayTasks = getTasksForDate(cd.date);
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDateStr;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(cd.date)}
                    className={`calendar-day p-1 sm:p-2 flex flex-col items-center justify-start min-h-[48px] sm:min-h-[64px] ${
                      !cd.isCurrentMonth ? 'opacity-30' : ''
                    } ${isToday ? 'today' : ''} ${
                      isSelected ? '!border-[var(--accent)] bg-[var(--accent-glow)]' : ''
                    }`}
                  >
                    <span className={`text-xs sm:text-sm font-medium ${
                      isToday ? 'text-[var(--accent)] font-bold' : 'text-[var(--text-primary)]'
                    }`}>
                      {cd.day}
                    </span>
                    {dayTasks.length > 0 && (
                      <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                        {dayTasks.slice(0, 3).map((t, i) => (
                          <span
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${
                              t.completed ? 'bg-emerald-500' : 'bg-[var(--accent)]'
                            }`}
                          />
                        ))}
                        {dayTasks.length > 3 && (
                          <span className="text-[8px] text-[var(--text-muted)]">
                            +{dayTasks.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Selected date tasks */}
          <motion.div variants={item} className="glass-card p-4 sm:p-5">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">
              {selectedDate
                ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                : 'Today'}
              <span className="text-[var(--text-muted)] font-normal ml-2">
                ({selectedTasks.length} tasks)
              </span>
            </h3>
            {selectedTasks.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] text-center py-8">
                No tasks for this date
              </p>
            ) : (
              <div className="space-y-2">
                {selectedTasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-hover)] transition-colors group"
                  >
                    <button
                      onClick={() => toggleComplete(task.id)}
                      className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        task.completed
                          ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                          : 'border-[var(--border-color)] hover:border-[var(--accent)]'
                      }`}
                    >
                      {task.completed && (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        task.completed ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'
                      }`}>
                        {task.title}
                      </p>
                      {task.dueTime && (
                        <p className="text-xs text-[var(--text-muted)]">{task.dueTime}</p>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(task)}
                        className="p-1.5 rounded-lg hover:bg-[var(--accent-glow)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      ) : (
        <motion.div variants={item}>
          <TimeBlockGrid
            date={selectedDate || new Date()}
            tasks={selectedTasks}
            onEditTask={handleEdit}
            onToggleComplete={toggleComplete}
            onAddTask={() => { setEditingTask(null); setModalOpen(true); }}
          />
        </motion.div>
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
