import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Moon, Sun, Trash2, AlertTriangle, Palette } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { CATEGORIES } from '../utils';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

export default function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const { tasks, clearAll } = useTasks();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClearAll = () => {
    clearAll();
    setShowConfirm(false);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <SettingsIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white tracking-tight">
              Settings
            </h1>
            <p className="text-sm text-surface-500">Customize your experience</p>
          </div>
        </div>
      </motion.div>

      {/* Appearance */}
      <motion.div variants={item} className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          <h2 className="text-sm font-bold text-surface-900 dark:text-white">Appearance</h2>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-surface-100 dark:border-dark-border">
          <div className="flex items-center gap-3">
            {isDark ? <Moon className="w-4 h-4 text-surface-500" /> : <Sun className="w-4 h-4 text-surface-500" />}
            <div>
              <p className="text-sm font-medium text-surface-900 dark:text-white">Dark Mode</p>
              <p className="text-xs text-surface-500">Switch between light and dark theme</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
              isDark ? 'bg-primary-600' : 'bg-surface-300'
            }`}
          >
            <motion.div
              layout
              className="absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow-sm"
              style={{ left: isDark ? 'calc(100% - 21px)' : '3px' }}
            />
          </button>
        </div>
      </motion.div>

      {/* Categories */}
      <motion.div variants={item} className="glass-card p-5">
        <h2 className="text-sm font-bold text-surface-900 dark:text-white mb-4">Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CATEGORIES.map(cat => (
            <div
              key={cat.value}
              className={`px-3 py-2 rounded-xl text-sm font-medium text-center ${cat.color}`}
            >
              {cat.label}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Data */}
      <motion.div variants={item} className="glass-card p-5">
        <h2 className="text-sm font-bold text-surface-900 dark:text-white mb-4">Data Management</h2>

        <div className="flex items-center justify-between py-3 border-b border-surface-100 dark:border-dark-border">
          <div>
            <p className="text-sm font-medium text-surface-900 dark:text-white">Total Tasks</p>
            <p className="text-xs text-surface-500">{tasks.length} tasks stored in local storage</p>
          </div>
        </div>

        <div className="pt-4">
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </button>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                  Delete all {tasks.length} tasks?
                </p>
                <p className="text-xs text-red-500 dark:text-red-400/70">This cannot be undone.</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="btn-secondary text-xs px-3 py-1.5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAll}
                  className="bg-red-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* About */}
      <motion.div variants={item} className="glass-card p-5">
        <h2 className="text-sm font-bold text-surface-900 dark:text-white mb-2">About TaskFlow</h2>
        <p className="text-xs text-surface-500 leading-relaxed">
          TaskFlow is a modern productivity dashboard for daily task management. 
          Built with React, Tailwind CSS, and Framer Motion. All data is stored locally in your browser.
        </p>
        <p className="text-xs text-surface-400 mt-2">Version 1.0.0</p>
      </motion.div>
    </motion.div>
  );
}
