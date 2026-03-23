import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import SyncStatus from './SyncStatus';
import Toast from './Toast';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header
          className="lg:hidden flex items-center justify-between px-4 py-3 border-b"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            paddingTop: 'max(12px, env(safe-area-inset-top))',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            TaskFlow
          </span>
          <SyncStatus />
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto main-content-area">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom nav for mobile */}
      <BottomNav />

      <Toast />
    </div>
  );
}
