import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Trash2, AlertTriangle, Palette, Check } from 'lucide-react';
import { useTheme, THEMES } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { useOffline } from '../context/OfflineContext';
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
  const { theme, setTheme } = useTheme();
  const { tasks, clearAll } = useTasks();
  const { isOnline, syncStatus, lastSyncTime, syncNow, pendingCount } = useOffline();
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
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              Settings
            </h1>
            <p className="text-sm text-[var(--text-muted)]">Customize your experience</p>
          </div>
        </div>
      </motion.div>

      {/* Theme Picker */}
      <motion.div variants={item} className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-4 h-4 text-[var(--accent)]" />
          <h2 className="text-sm font-bold text-[var(--text-primary)]">Theme</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left group ${
                theme === t.id
                  ? 'border-[var(--accent)] shadow-lg'
                  : 'border-[var(--border-color)] hover:border-[var(--text-muted)]'
              }`}
              style={{
                background: t.preview[0],
              }}
            >
              {/* Selected check */}
              {theme === t.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--accent)' }}
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}

              {/* Color preview dots */}
              <div className="flex gap-1.5 mb-3">
                {t.preview.map((color, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full border border-white/10"
                    style={{ background: color }}
                  />
                ))}
              </div>

              <p className="text-sm font-bold" style={{ color: t.preview[3] || '#fff' }}>
                {t.label}
              </p>
              <p className="text-[10px] mt-0.5 opacity-60" style={{ color: t.preview[3] || '#aaa' }}>
                {t.description}
              </p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Sync Settings */}
      <motion.div variants={item} className="glass-card p-5">
        <h2 className="text-sm font-bold text-[var(--text-primary)] mb-4">Sync & Offline</h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Connection Status</p>
              <p className="text-xs text-[var(--text-muted)]">
                {isOnline ? 'Connected to the internet' : 'Working offline'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`sync-dot ${isOnline ? 'online' : 'offline'}`} />
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Pending Changes</p>
              <p className="text-xs text-[var(--text-muted)]">
                {pendingCount > 0 ? `${pendingCount} changes waiting to sync` : 'All changes synced'}
              </p>
            </div>
            <button
              onClick={syncNow}
              disabled={!isOnline || pendingCount === 0}
              className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40"
            >
              Sync Now
            </button>
          </div>

          {lastSyncTime && (
            <p className="text-xs text-[var(--text-muted)]">
              Last synced: {new Date(lastSyncTime).toLocaleString()}
            </p>
          )}
        </div>
      </motion.div>

      {/* Categories */}
      <motion.div variants={item} className="glass-card p-5">
        <h2 className="text-sm font-bold text-[var(--text-primary)] mb-4">Categories</h2>
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
        <h2 className="text-sm font-bold text-[var(--text-primary)] mb-4">Data Management</h2>

        <div
          className="flex items-center justify-between py-3"
          style={{ borderBottom: '1px solid var(--border-color)' }}
        >
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">Total Tasks</p>
            <p className="text-xs text-[var(--text-muted)]">{tasks.length} tasks stored locally</p>
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
            <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-500">
                  Delete all {tasks.length} tasks?
                </p>
                <p className="text-xs text-red-500/70">This cannot be undone.</p>
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
        <h2 className="text-sm font-bold text-[var(--text-primary)] mb-2">About TaskFlow</h2>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          TaskFlow is a modern productivity dashboard with themes, calendar, time blocking, and offline support.
          Built with React, Tailwind CSS, and Framer Motion.
        </p>
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-[var(--text-muted)] opacity-60">Version 2.0.0</p>
          <p className="text-xs font-semibold text-[var(--accent)]">Powered by: Gavan Kumar</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
