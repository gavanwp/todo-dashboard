import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Sun as SunIcon,
  CalendarDays,
  CheckCircle2,
  Settings,
  Calendar,
  X,
  ListTodo,
  User,
  Flame,
  Target,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useProfile } from '../context/ProfileContext';
import SyncStatus from './SyncStatus';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/today', icon: SunIcon, label: 'Today' },
  { to: '/habits', icon: Flame, label: 'Habits' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/upcoming', icon: CalendarDays, label: 'Upcoming' },
  { to: '/completed', icon: CheckCircle2, label: 'Completed' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { theme } = useTheme();
  const { profile, stats } = useProfile();

  const initials = profile.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] flex items-center justify-center shadow-lg">
              <ListTodo className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              TaskFlow
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile mini card */}
        <NavLink
          to="/profile"
          onClick={onClose}
          className="mx-3 mt-4 p-3 rounded-xl flex items-center gap-3 transition-all hover:bg-[var(--bg-hover)]"
        >
          <div className="avatar-ring flex-shrink-0">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="w-9 h-9 object-cover" />
            ) : (
              <div className="avatar-placeholder w-9 h-9 text-xs">{initials}</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {profile.name}
            </p>
            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              {stats.streak > 0 && (
                <>
                  <Flame className="w-3 h-3 text-orange-500" />
                  <span>{stats.streak}d streak</span>
                </>
              )}
              {stats.streak === 0 && <span>{stats.todayCompleted} done today</span>}
            </div>
          </div>
        </NavLink>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p
            className="px-4 text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            Menu
          </p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="w-[18px] h-[18px]" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sync status */}
        <div
          className="px-4 py-3 hidden lg:flex items-center justify-between"
          style={{ borderTop: '1px solid var(--border-color)' }}
        >
          <SyncStatus />
        </div>
      </motion.aside>
    </>
  );
}
