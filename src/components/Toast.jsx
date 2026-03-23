import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { formatTime } from '../utils';

export default function Toast() {
  const { tasks } = useTasks();
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  useEffect(() => {
    const checkDueTasks = () => {
      const now = new Date();
      const activeTasks = tasks.filter(t => !t.completed && t.dueDate && t.dueTime);

      activeTasks.forEach(task => {
        const dueDate = new Date(`${task.dueDate}T${task.dueTime}`);
        const diff = dueDate - now;

        // Notify if due within 15 minutes and not already notified
        if (diff > 0 && diff <= 15 * 60 * 1000) {
          setNotifications(prev => {
            if (prev.find(n => n.taskId === task.id)) return prev;
            const newNotif = {
              id: Date.now() + Math.random(),
              taskId: task.id,
              title: task.title,
              message: `Due at ${formatTime(task.dueTime)}`,
            };
            // Auto-remove after 8 seconds
            setTimeout(() => removeNotification(newNotif.id), 8000);
            return [...prev, newNotif];
          });
        }
      });
    };

    checkDueTasks();
    const interval = setInterval(checkDueTasks, 60000);
    return () => clearInterval(interval);
  }, [tasks, removeNotification]);

  return (
    <div className="fixed top-4 right-4 z-[60] space-y-2 max-w-sm">
      <AnimatePresence>
        {notifications.map(notif => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className="glass-card p-4 flex items-start gap-3 shadow-lg"
          >
            <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
              <Bell className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">
                {notif.title}
              </p>
              <p className="text-xs text-surface-500 mt-0.5">{notif.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notif.id)}
              className="text-surface-400 hover:text-surface-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
