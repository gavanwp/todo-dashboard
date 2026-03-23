import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  ListTodo,
  Plus,
  TrendingUp,
  Target,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import ProgressBar from '../components/ProgressBar';
import TaskModal from '../components/TaskModal';
import TaskCard from '../components/TaskCard';
import { isToday, getStartOfWeek, getDayName } from '../utils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { tasks, addTask, editTask, deleteTask, toggleComplete } = useTasks();
  const { isDark } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const todayTasks = tasks.filter(t => isToday(t.dueDate));
  const todayCompleted = todayTasks.filter(t => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Weekly chart data
  const weeklyData = useMemo(() => {
    const start = getStartOfWeek();
    const days = [];
    const completed = [];
    const created = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(getDayName(day));

      const dayStr = day.toISOString().split('T')[0];
      completed.push(
        tasks.filter(t => t.completedAt && t.completedAt.startsWith(dayStr)).length
      );
      created.push(
        tasks.filter(t => t.createdAt && t.createdAt.startsWith(dayStr)).length
      );
    }

    return { days, completed, created };
  }, [tasks]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: { size: 11, family: 'Inter' },
          color: isDark ? '#adb5bd' : '#495057',
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#1a1d27' : '#fff',
        titleColor: isDark ? '#fff' : '#212529',
        bodyColor: isDark ? '#adb5bd' : '#495057',
        borderColor: isDark ? '#2a2d3a' : '#e9ecef',
        borderWidth: 1,
        cornerRadius: 12,
        padding: 12,
        titleFont: { family: 'Inter', weight: '600' },
        bodyFont: { family: 'Inter' },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, family: 'Inter' }, color: isDark ? '#868e96' : '#adb5bd' },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: { size: 11, family: 'Inter' },
          color: isDark ? '#868e96' : '#adb5bd',
        },
        grid: { color: isDark ? '#2a2d3a' : '#f1f3f5' },
        border: { display: false },
      },
    },
  };

  const chartData = {
    labels: weeklyData.days,
    datasets: [
      {
        label: 'Completed',
        data: weeklyData.completed,
        backgroundColor: isDark ? 'rgba(92, 124, 250, 0.7)' : 'rgba(76, 110, 245, 0.8)',
        borderRadius: 6,
        barPercentage: 0.6,
      },
      {
        label: 'Created',
        data: weeklyData.created,
        backgroundColor: isDark ? 'rgba(92, 124, 250, 0.2)' : 'rgba(76, 110, 245, 0.15)',
        borderRadius: 6,
        barPercentage: 0.6,
      },
    ],
  };

  const recentTasks = tasks.filter(t => !t.completed).slice(0, 5);

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

  const stats = [
    { label: 'Total Tasks', value: totalTasks, icon: ListTodo, color: 'from-primary-500 to-primary-600' },
    { label: 'Completed', value: completedTasks, icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Pending', value: pendingTasks, icon: Clock, color: 'from-amber-500 to-amber-600' },
    { label: 'Completion Rate', value: `${completionRate}%`, icon: TrendingUp, color: 'from-violet-500 to-violet-600' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-surface-500 mt-1">
            Welcome back! Here's your productivity overview.
          </p>
        </div>
        <button
          onClick={() => { setEditingTask(null); setModalOpen(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            variants={item}
            className="glass-card p-4 sm:p-5 hover:shadow-card-hover transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">
              {stat.value}
            </p>
            <p className="text-xs font-medium text-surface-500 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Daily progress */}
      <motion.div variants={item} className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <h2 className="text-sm font-bold text-surface-900 dark:text-white">Daily Progress</h2>
          </div>
          <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
            {todayCompleted}/{todayTasks.length} tasks
          </span>
        </div>
        <ProgressBar value={todayCompleted} max={todayTasks.length || 1} size="md" />
        <p className="text-xs text-surface-500 mt-2">
          {todayTasks.length === 0
            ? 'No tasks scheduled for today'
            : todayCompleted === todayTasks.length
            ? '🎉 All daily tasks completed!'
            : `${todayTasks.length - todayCompleted} tasks remaining for today`}
        </p>
      </motion.div>

      {/* Chart + Recent tasks */}
      <div className="grid lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Weekly chart */}
        <motion.div variants={item} className="lg:col-span-3 glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <h2 className="text-sm font-bold text-surface-900 dark:text-white">Weekly Overview</h2>
          </div>
          <div className="h-[220px]">
            <Bar options={chartOptions} data={chartData} />
          </div>
        </motion.div>

        {/* Recent tasks */}
        <motion.div variants={item} className="lg:col-span-2 glass-card p-5">
          <h2 className="text-sm font-bold text-surface-900 dark:text-white mb-3">Recent Tasks</h2>
          <div className="space-y-2">
            {recentTasks.length === 0 ? (
              <p className="text-sm text-surface-400 dark:text-surface-600 py-8 text-center">
                No pending tasks. Add one to get started!
              </p>
            ) : (
              recentTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={toggleComplete}
                  onEdit={handleEdit}
                  onDelete={deleteTask}
                />
              ))
            )}
          </div>
        </motion.div>
      </div>

      <TaskModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(null); }}
        onSave={handleSave}
        editTask={editingTask}
      />
    </motion.div>
  );
}
