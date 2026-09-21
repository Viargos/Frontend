'use client';

import { useEffect } from 'react';
import { ShellErrorBoundary } from '@/modules/common/components/ShellErrorBoundary';
import { NotificationProvider } from '@/modules/notifications';
import { AnimatedSidebar } from './AnimatedSidebar';
import { DashboardBottomNav } from './DashboardBottomNav';
import { DashboardSidebar } from './DashboardSidebar';

export const DashboardShell = (props: { children: React.ReactNode }) => {
  const { children } = props;
  const collapsed = false;

  useEffect(() => {
    document.documentElement.classList.add('dashboard-scrollbar-hidden');

    return () => {
      document.documentElement.classList.remove('dashboard-scrollbar-hidden');
    };
  }, []);

  return (
    <ShellErrorBoundary>
      <NotificationProvider>
        <div className="flex min-h-screen bg-white" data-dashboard-shell>
          <div className="flex min-h-screen min-w-0 flex-1">
            <AnimatedSidebar collapsed={collapsed}>
              <DashboardSidebar collapsed={collapsed} />
            </AnimatedSidebar>

            <main
              aria-label="Dashboard content"
              className="flex min-h-screen min-w-0 flex-1 touch-pan-y flex-col overflow-x-clip transition-all duration-300"
              data-dashboard-scroll-container
            >
              <div className="flex min-h-screen w-full flex-col pb-20 sm:pb-0">
                <div className="flex min-h-0 w-full flex-1 flex-col">{children}</div>
              </div>
            </main>
          </div>

          <DashboardBottomNav />
        </div>
      </NotificationProvider>
    </ShellErrorBoundary>
  );
};
