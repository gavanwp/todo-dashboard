import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Sun as SunIcon,
  CalendarDays,
  CheckCircle2,
  Settings,
  Moon,
  Sun,
  Menu,
  X,
  ListTodo,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/today', icon: SunIcon, label: 'Today' },
  { to: '/upcoming', icon: CalendarDays, label: 'Upcoming' },
  { to: '/completed', icon: CheckCircle2, label: 'Completed' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

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
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] bg-white dark:bg-dark-card border-r border-surface-200 dark:border-dark-border flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-100 dark:border-dark-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <ListTodo className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-surface-900 dark:text-white tracking-tight">
              TaskFlow
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-dark-hover text-surface-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-surface-400 dark:text-surface-600 uppercase tracking-wider mb-3">
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

        {/* Theme toggle */}
        <div className="px-3 py-4 border-t border-surface-100 dark:border-dark-border">
          <button
            onClick={toggleTheme}
            className="sidebar-link w-full justify-between"
          >
            <div className="flex items-center gap-3">
              {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
            <div
              className={`w-9 h-5 rounded-full transition-colors duration-200 flex items-center ${
                isDark ? 'bg-primary-600 justify-end' : 'bg-surface-300 justify-start'
              }`}
            >
              <motion.div
                layout
                className="w-3.5 h-3.5 bg-white rounded-full mx-[3px] shadow-sm"
              />
            </div>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
