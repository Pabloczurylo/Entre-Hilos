import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { cn } from '../../lib/utils';

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('eh_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleDesktopSidebar = () => {
    setDesktopCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('eh_sidebar_collapsed', String(next));
      } catch {
        // ignore localStorage errors
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-surface-container-low">
      <Sidebar
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isDesktopCollapsed={desktopCollapsed}
        onToggleDesktop={toggleDesktopSidebar}
      />

      {/* Main content pushed right of sidebar on desktop when expanded */}
      <div
        className={cn(
          'flex flex-col min-h-screen transition-[padding] duration-300 ease-in-out',
          desktopCollapsed ? 'lg:pl-0' : 'lg:pl-64'
        )}
      >
        <Topbar
          onMenuClick={() => setMobileOpen(true)}
          isDesktopCollapsed={desktopCollapsed}
          onToggleDesktop={toggleDesktopSidebar}
        />

        <main className="flex-1 pt-16 px-4 lg:px-8 pb-10">
          <div className="max-w-screen-xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
