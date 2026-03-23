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
import { useProfile } from '../context/ProfileContext';
import { useTheme, CHART_COLORS } from '../context/ThemeContext';
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
  const { profile, stats } = useProfile();
  const { theme } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const colors = CHART_COLORS[theme] || CHART_COLORS.dark;

  // Stats
  const totalTasks = tasks.length;
  const pendingTasks = totalTasks - stats.completedTasks;
  const todayTasks = tasks.filter(t => isToday(t.dueDate));

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
          color: colors.textSecondary,
        },
      },
      tooltip: {
        backgroundColor: colors.bgCard,
        titleColor: colors.textPrimary,
        bodyColor: colors.textSecondary,
        borderColor: colors.borderColor,
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
        ticks: { font: { size: 11, family: 'Inter' }, color: colors.textMuted },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: { size: 11, family: 'Inter' },
          color: colors.textMuted,
        },
        grid: { color: colors.borderColor },
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
        backgroundColor: colors.accent,
        borderRadius: 6,
        barPercentage: 0.6,
      },
      {
        label: 'Created',
        data: weeklyData.created,
        backgroundColor: colors.accentGlow,
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

  const statCards = [
    { label: 'Total Tasks', value: totalTasks, icon: ListTodo, color: 'from-blue-500 to-blue-600' },
    { label: 'Completed', value: stats.completedTasks, icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Pending', value: pendingTasks, icon: Clock, color: 'from-amber-500 to-amber-600' },
    { label: 'Completion Rate', value: `${stats.completionRate}%`, icon: TrendingUp, color: 'from-violet-500 to-violet-600' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Welcome back, {profile.name}! Here's your productivity overview.
          </p>
        </div>
        <button
          onClick={() => { setEditingTask(null); setModalOpen(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Task</span>
          <span className="sm:hidden">Add</span>
        </button>
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.label}
            variants={item}
            className="glass-card p-4 sm:p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              {stat.value}
            </p>
            <p className="text-xs font-medium text-[var(--text-muted)] mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Daily progress */}
      <motion.div variants={item} className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[var(--accent)]" />
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Daily Progress</h2>
          </div>
          <span className="text-sm font-bold text-[var(--accent)]">
            {stats.todayCompleted}/{todayTasks.length} tasks
          </span>
        </div>
        <ProgressBar value={stats.todayCompleted} max={todayTasks.length || 1} size="md" />
        <p className="text-xs text-[var(--text-muted)] mt-2">
          {todayTasks.length === 0
            ? 'No tasks scheduled for today'
            : stats.todayCompleted === todayTasks.length
            ? '🎉 All daily tasks completed!'
            : `${todayTasks.length - stats.todayCompleted} tasks remaining for today`}
        </p>
      </motion.div>

      {/* Chart + Recent tasks */}
      <div className="grid lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Weekly chart */}
        <motion.div variants={item} className="lg:col-span-3 glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-[var(--accent)]" />
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Weekly Overview</h2>
          </div>
          <div className="h-[220px]">
            <Bar options={chartOptions} data={chartData} />
          </div>
        </motion.div>

        {/* Recent tasks */}
        <motion.div variants={item} className="lg:col-span-2 glass-card p-4 sm:p-5">
          <h2 className="text-sm font-bold text-[var(--text-primary)] mb-3">Recent Tasks</h2>
          <div className="space-y-2">
            {recentTasks.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] py-8 text-center">
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
