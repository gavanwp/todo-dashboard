import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useTasks } from './TaskContext';

const ProfileContext = createContext();

const STORAGE_KEY = 'taskflow-profile';

const defaultProfile = {
  name: 'User',
  avatar: null, // base64 string
  joinedAt: new Date().toISOString(),
};

const loadProfile = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? { ...defaultProfile, ...JSON.parse(data) } : { ...defaultProfile };
  } catch {
    return { ...defaultProfile };
  }
};

export function ProfileProvider({ children }) {
  const [profile, setProfileState] = useState(loadProfile);
  const { tasks } = useTasks();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const updateProfile = (updates) => {
    setProfileState(prev => ({ ...prev, ...updates }));
  };

  const setAvatar = (base64) => {
    updateProfile({ avatar: base64 });
  };

  // Productivity stats
  const stats = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Today's tasks
    const todayCompleted = tasks.filter(t =>
      t.completed && t.completedAt && t.completedAt.startsWith(today)
    ).length;

    // Streak calculation (consecutive days with at least 1 task completed)
    let streak = 0;
    const checkDate = new Date(now);
    // Check if today has completions, if not start from yesterday
    const todayHasCompletion = tasks.some(t =>
      t.completed && t.completedAt && t.completedAt.startsWith(today)
    );
    if (!todayHasCompletion) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const hasCompletion = tasks.some(t =>
        t.completed && t.completedAt && t.completedAt.startsWith(dateStr)
      );
      if (hasCompletion) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Weekly stats (last 7 days)
    const weeklyCompleted = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      weeklyCompleted.push({
        date: ds,
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        count: tasks.filter(t => t.completed && t.completedAt && t.completedAt.startsWith(ds)).length,
      });
    }

    // Category breakdown
    const categoryBreakdown = {};
    tasks.forEach(t => {
      const cat = t.category || 'other';
      if (!categoryBreakdown[cat]) categoryBreakdown[cat] = { total: 0, completed: 0 };
      categoryBreakdown[cat].total++;
      if (t.completed) categoryBreakdown[cat].completed++;
    });

    // Most productive hour
    const hourCounts = {};
    tasks.forEach(t => {
      if (t.completed && t.completedAt) {
        const hour = new Date(t.completedAt).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });
    const bestHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      totalTasks,
      completedTasks,
      completionRate,
      todayCompleted,
      streak,
      weeklyCompleted,
      categoryBreakdown,
      bestHour: bestHour ? parseInt(bestHour[0]) : null,
    };
  }, [tasks]);

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, setAvatar, stats }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within ProfileProvider');
  return context;
};
