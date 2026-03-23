import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TaskProvider } from './context/TaskContext';
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
import InstallPrompt from './components/InstallPrompt';

export default function App() {
  return (
    <ThemeProvider>
      <OfflineProvider>
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
                </Route>
              </Routes>
            </BrowserRouter>
            <InstallPrompt />
          </ProfileProvider>
        </TaskProvider>
      </OfflineProvider>
    </ThemeProvider>
  );
}
