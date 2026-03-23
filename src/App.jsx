import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TaskProvider } from './context/TaskContext';
import { GoalProvider } from './context/GoalContext';
import { HabitProvider } from './context/HabitContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProfileProvider } from './context/ProfileContext';
import { OfflineProvider } from './context/OfflineContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Today from './pages/Today';
import Upcoming from './pages/Upcoming';
import Completed from './pages/Completed';
import Settings from './pages/Settings';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';
import Goals from './pages/Goals';
import Habits from './pages/Habits';
import InstallPrompt from './components/InstallPrompt';

export default function App() {
  return (
    <ThemeProvider>
      <OfflineProvider>
        <GoalProvider>
          <HabitProvider>
            <TaskProvider>
              <ProfileProvider>
                <BrowserRouter>
                  <Routes>
                    <Route element={<Layout />}>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/today" element={<Today />} />
                      <Route path="/upcoming" element={<Upcoming />} />
                      <Route path="/completed" element={<Completed />} />
                      <Route path="/calendar" element={<Calendar />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/goals" element={<Goals />} />
                      <Route path="/habits" element={<Habits />} />
                    </Route>
                  </Routes>
                </BrowserRouter>
                <InstallPrompt />
              </ProfileProvider>
            </TaskProvider>
          </HabitProvider>
        </GoalProvider>
      </OfflineProvider>
    </ThemeProvider>
  );
}
