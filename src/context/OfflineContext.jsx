import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const OfflineContext = createContext();

const SYNC_QUEUE_KEY = 'taskflow-sync-queue';
const TASKS_KEY = 'taskflow-tasks';

const loadQueue = () => {
  try {
    const data = localStorage.getItem(SYNC_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveQueue = (queue) => {
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
};

export function OfflineProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | syncing | synced | error
  const [syncQueue, setSyncQueue] = useState(loadQueue);
  const [lastSyncTime, setLastSyncTime] = useState(() => {
    return localStorage.getItem('taskflow-last-sync') || null;
  });
  const syncTimeoutRef = useRef(null);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when coming back online
      flushQueue();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('idle');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Queue a change for sync
  const queueChange = useCallback((action) => {
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      action,
      timestamp: new Date().toISOString(),
      synced: false,
    };
    setSyncQueue(prev => {
      const updated = [...prev, entry];
      saveQueue(updated);
      return updated;
    });
  }, []);

  // Flush sync queue (simulate sync to local storage backup)
  const flushQueue = useCallback(() => {
    if (!navigator.onLine) return;

    setSyncStatus('syncing');

    // Simulate sync delay
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      try {
        // Mark all as synced
        setSyncQueue(prev => {
          const updated = prev.map(entry => ({ ...entry, synced: true }));
          // Clear synced items
          saveQueue([]);
          return [];
        });

        // Create backup
        const tasks = localStorage.getItem(TASKS_KEY);
        if (tasks) {
          localStorage.setItem('taskflow-tasks-backup', tasks);
        }

        const now = new Date().toISOString();
        setLastSyncTime(now);
        localStorage.setItem('taskflow-last-sync', now);
        setSyncStatus('synced');

        // Reset to idle after 3s
        setTimeout(() => setSyncStatus('idle'), 3000);
      } catch (err) {
        console.error('Sync error:', err);
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 5000);
      }
    }, 800);
  }, []);

  // Resolve conflicts (last-write-wins)
  const resolveConflict = useCallback((localData, remoteData) => {
    if (!localData || !remoteData) return localData || remoteData;

    const localTime = new Date(localData.updatedAt || 0).getTime();
    const remoteTime = new Date(remoteData.updatedAt || 0).getTime();

    return localTime >= remoteTime ? localData : remoteData;
  }, []);

  // Manual sync trigger
  const syncNow = useCallback(() => {
    if (isOnline) {
      flushQueue();
    }
  }, [isOnline, flushQueue]);

  // Pending changes count
  const pendingCount = syncQueue.filter(q => !q.synced).length;

  return (
    <OfflineContext.Provider value={{
      isOnline,
      syncStatus,
      pendingCount,
      lastSyncTime,
      queueChange,
      syncNow,
      resolveConflict,
    }}>
      {children}
    </OfflineContext.Provider>
  );
}

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) throw new Error('useOffline must be used within OfflineProvider');
  return context;
};
