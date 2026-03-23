import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Camera,
  Flame,
  Target,
  TrendingUp,
  Calendar,
  Award,
  Clock,
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
import { useProfile } from '../context/ProfileContext';
import { useTheme, CHART_COLORS } from '../context/ThemeContext';
import { CATEGORIES } from '../utils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

export default function Profile() {
  const { profile, updateProfile, setAvatar, stats } = useProfile();
  const { isDark, theme } = useTheme();
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(profile.name);
  const fileInputRef = useRef(null);

  const colors = CHART_COLORS[theme] || CHART_COLORS.dark;

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      // Resize image
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 200;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        setAvatar(canvas.toDataURL('image/webp', 0.8));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const saveName = () => {
    updateProfile({ name: name.trim() || 'User' });
    setEditingName(false);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: colors.bgCard,
        titleColor: colors.textPrimary,
        bodyColor: colors.textSecondary,
        borderColor: colors.borderColor,
        borderWidth: 1,
        cornerRadius: 12,
        padding: 12,
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
        ticks: { stepSize: 1, font: { size: 11, family: 'Inter' }, color: colors.textMuted },
        grid: { color: colors.borderColor },
        border: { display: false },
      },
    },
  };

  const weeklyChartData = {
    labels: stats.weeklyCompleted.map(d => d.day),
    datasets: [
      {
        data: stats.weeklyCompleted.map(d => d.count),
        backgroundColor: colors.accent,
        borderRadius: 6,
        barPercentage: 0.6,
      },
    ],
  };

  const initials = profile.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const statCards = [
    { label: 'Total Tasks', value: stats.totalTasks, icon: Target, gradient: 'from-blue-500 to-blue-600' },
    { label: 'Completed', value: stats.completedTasks, icon: TrendingUp, gradient: 'from-emerald-500 to-emerald-600' },
    { label: 'Streak', value: `${stats.streak}d`, icon: Flame, gradient: 'from-orange-500 to-red-500' },
    { label: 'Completion', value: `${stats.completionRate}%`, icon: Award, gradient: 'from-violet-500 to-purple-600' },
  ];

  const formatBestHour = (h) => {
    if (h === null) return 'N/A';
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12} ${ampm}`;
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/25">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              Profile
            </h1>
            <p className="text-sm text-[var(--text-muted)]">Your productivity overview</p>
          </div>
        </div>
      </motion.div>

      {/* Profile card */}
      <motion.div variants={item} className="glass-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Avatar */}
          <div className="relative group">
            <div className="avatar-ring">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover"
                />
              ) : (
                <div className="avatar-placeholder w-20 h-20 sm:w-24 sm:h-24 text-2xl">
                  {initials}
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera className="w-5 h-5 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>

          {/* Name + info */}
          <div className="text-center sm:text-left flex-1">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveName()}
                  className="input-field text-lg font-bold max-w-xs"
                  autoFocus
                />
                <button onClick={saveName} className="btn-primary text-xs px-3 py-1.5">Save</button>
              </div>
            ) : (
              <h2
                className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] cursor-pointer hover:text-[var(--accent)] transition-colors"
                onClick={() => setEditingName(true)}
              >
                {profile.name}
              </h2>
            )}
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {stats.todayCompleted} tasks completed today
            </p>
            {stats.streak > 0 && (
              <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-semibold">
                <Flame className="w-3 h-3" />
                {stats.streak} day streak
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(stat => (
          <div key={stat.label} className="glass-card p-4">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3`}>
              <stat.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Weekly activity */}
        <motion.div variants={item} className="glass-card p-5">
          <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">Weekly Activity</h3>
          <div className="h-[200px]">
            <Bar options={chartOptions} data={weeklyChartData} />
          </div>
        </motion.div>

        {/* Category breakdown */}
        <motion.div variants={item} className="glass-card p-5">
          <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {CATEGORIES.map(cat => {
              const data = stats.categoryBreakdown[cat.value];
              if (!data || data.total === 0) return null;
              const pct = Math.round((data.completed / data.total) * 100);
              return (
                <div key={cat.value}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-[var(--text-primary)]">{cat.label}</span>
                    <span className="text-[var(--text-muted)]">{data.completed}/{data.total}</span>
                  </div>
                  <div className="h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full bg-[var(--accent)]"
                    />
                  </div>
                </div>
              );
            })}
            {Object.keys(stats.categoryBreakdown).length === 0 && (
              <p className="text-sm text-[var(--text-muted)] text-center py-4">No data yet</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Best hour */}
      {stats.bestHour !== null && (
        <motion.div variants={item} className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--text-primary)]">Most Productive Hour</p>
              <p className="text-xs text-[var(--text-muted)]">
                You tend to complete the most tasks around <span className="text-[var(--accent)] font-semibold">{formatBestHour(stats.bestHour)}</span>
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
