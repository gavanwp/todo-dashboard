import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

export const THEMES = [
  {
    id: 'dark',
    label: 'Dark',
    description: 'Classic dark mode',
    preview: ['#0f1117', '#1a1d27', '#5c7cfa', '#e9ecef'],
  },
  {
    id: 'neon',
    label: 'Neon',
    description: 'Cyberpunk glow',
    preview: ['#0a0a1a', '#1a0a2e', '#00f0ff', '#ff00e5'],
  },
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Clean & simple',
    preview: ['#fafafa', '#ffffff', '#333333', '#e0e0e0'],
  },
  {
    id: 'glass',
    label: 'Glass',
    description: 'Frosted glass',
    preview: ['#1a1035', '#2a1f4e', '#a78bfa', '#7c3aed'],
  },
];

export const CHART_COLORS = {
  dark: {
    accent: '#5c7cfa',
    accentGlow: 'rgba(92, 124, 250, 0.15)',
    textPrimary: '#f1f3f5',
    textSecondary: '#adb5bd',
    textMuted: '#868e96',
    bgCard: '#1a1d27',
    borderColor: '#2a2d3a',
    bgHover: '#252836'
  },
  neon: {
    accent: '#00f0ff',
    accentGlow: 'rgba(0, 240, 255, 0.2)',
    textPrimary: '#e0e0ff',
    textSecondary: '#a0a0cc',
    textMuted: '#7070aa',
    bgCard: '#12102a',
    borderColor: '#2a1f5e',
    bgHover: '#1e1a3a'
  },
  minimal: {
    accent: '#262626',
    accentGlow: 'rgba(0, 0, 0, 0.04)',
    textPrimary: '#1a1a1a',
    textSecondary: '#666666',
    textMuted: '#999999',
    bgCard: '#ffffff',
    borderColor: '#e5e5e5',
    bgHover: '#f0f0f0'
  },
  glass: {
    accent: '#a78bfa',
    accentGlow: 'rgba(167, 139, 250, 0.2)',
    textPrimary: '#f0e6ff',
    textSecondary: '#c4b5d9',
    textMuted: '#8b7aaa',
    bgCard: '#2a1f4e',
    borderColor: 'rgba(139, 92, 246, 0.2)',
    bgHover: '#362960'
  }
};

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('taskflow-theme');
    // Migrate from old boolean dark/light
    if (saved === 'dark' || saved === 'light') {
      return saved === 'dark' ? 'dark' : 'minimal';
    }
    return saved || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;

    // Remove all theme classes
    root.classList.remove('dark', 'neon', 'minimal', 'glass');
    root.removeAttribute('data-theme');

    // Apply theme
    root.setAttribute('data-theme', theme);

    // Dark-class for Tailwind dark: prefix compatibility
    if (theme === 'dark' || theme === 'neon' || theme === 'glass') {
      root.classList.add('dark');
    }

    // Also add specific theme class
    root.classList.add(theme);

    localStorage.setItem('taskflow-theme', theme);
  }, [theme]);

  const setTheme = useCallback((t) => {
    if (THEMES.find(th => th.id === t)) {
      setThemeState(t);
    }
  }, []);

  // Backward compat
  const isDark = theme === 'dark' || theme === 'neon' || theme === 'glass';
  const toggleTheme = () => {
    setThemeState(prev => (prev === 'dark' ? 'minimal' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
