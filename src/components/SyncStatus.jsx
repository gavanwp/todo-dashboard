import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { useOffline } from '../context/OfflineContext';

const statusConfig = {
  idle: { icon: null, label: '' },
  syncing: { icon: RefreshCw, label: 'Syncing...' },
  synced: { icon: Check, label: 'Synced' },
  error: { icon: AlertCircle, label: 'Sync failed' },
};

export default function SyncStatus() {
  const { isOnline, syncStatus, pendingCount, syncNow } = useOffline();

  return (
    <div className="flex items-center gap-2">
      {/* Online/Offline indicator */}
      <button
        onClick={syncNow}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all hover:bg-[var(--bg-hover)]"
        title={isOnline ? 'Online' : 'Offline'}
      >
        <span className={`sync-dot ${isOnline ? 'online' : 'offline'}`} />
        {!isOnline && (
          <span className="text-[var(--text-muted)] hidden sm:inline">Offline</span>
        )}
        {pendingCount > 0 && (
          <span className="text-[var(--text-muted)]">
            {pendingCount} pending
          </span>
        )}
      </button>

      {/* Sync status animation */}
      <AnimatePresence mode="wait">
        {syncStatus !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1 text-xs"
          >
            {syncStatus === 'syncing' && (
              <RefreshCw className="w-3 h-3 text-[var(--accent)] animate-spin" />
            )}
            {syncStatus === 'synced' && (
              <Check className="w-3 h-3 text-emerald-500" />
            )}
            {syncStatus === 'error' && (
              <AlertCircle className="w-3 h-3 text-red-500" />
            )}
            <span className="text-[var(--text-muted)]">
              {statusConfig[syncStatus]?.label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
