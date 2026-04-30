'use client';

import { useState } from 'react';
import { ShellErrorBoundary } from '@/modules/common/components/ShellErrorBoundary';
import { AnimatedHeader } from './AnimatedHeader';
import { AnimatedSidebar } from './AnimatedSidebar';
import { DashboardBottomNav } from './DashboardBottomNav';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSidebar } from './DashboardSidebar';

export const DashboardShell = (props: { children: React.ReactNode }) => {
  const { children } = props;
  const [collapsed, setCollapsed] = useState(false);

  return (
    <ShellErrorBoundary>
      <div className="flex h-screen flex-col bg-gray-50">
        <AnimatedHeader>
          <DashboardHeader />
        </AnimatedHeader>

        <div className="flex flex-1 overflow-hidden">
          <AnimatedSidebar collapsed={collapsed}>
            <DashboardSidebar collapsed={collapsed} onToggle={() => setCollapsed(previous => !previous)} />
          </AnimatedSidebar>

          <div
            className="flex min-h-0 flex-1 flex-col overflow-y-auto transition-all duration-300"
            data-dashboard-scroll-container
          >
            <div className="flex min-h-0 flex-1 flex-col justify-center pb-20 sm:pb-0">
              <div className="flex min-h-0 w-full flex-1 flex-col">{children}</div>
            </div>
          </div>
        </div>

        <DashboardBottomNav />
      </div>
    </ShellErrorBoundary>
  );
};
