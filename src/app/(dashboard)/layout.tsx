'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { PageLoading, ErrorBoundary } from '@/components/common';
import { LeftSidebar } from '@/components/layout';
import { Header } from '@/components/home';
import { BottomNavigation } from '@/components/navigation';
import { AnimatedHeader, AnimatedSidebar } from '@/components/dashboard';

/**
 * Dashboard Layout - Layout for all authenticated routes
 * This layout automatically redirects unauthenticated users to home
 * and provides the authenticated dashboard UI structure
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsSidebarCollapsed(savedState === 'true');
    }
  }, []);

  // Save sidebar state to localStorage
  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
  };

  useEffect(() => {
    // Redirect unauthenticated users to home
    if (isAuthenticated === false) router.push('/');
  }, [isAuthenticated, router]);

  // Show loading while auth state is being determined or user is being redirected
  if (isAuthenticated === null) {
    return <PageLoading text="Loading..." />;
  }

  if (!isAuthenticated || !user) {
    return <PageLoading text="Redirecting..." />;
  }

  return (
    <ErrorBoundary>
      <div className="h-screen bg-gray-50 flex flex-col">
        {/* Fixed Top Header */}
        <AnimatedHeader>
          <Header user={user} />
        </AnimatedHeader>

        {/* Main Layout Container */}
        <div className="flex flex-1 overflow-hidden">
          {/* Fixed Left Sidebar - Collapsible on desktop */}
          <AnimatedSidebar isCollapsed={isSidebarCollapsed}>
            <LeftSidebar 
              user={user} 
              onLogout={logout}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={toggleSidebar}
            />
          </AnimatedSidebar>

          {/* Scrollable Main Content Area - Expands when sidebar collapses */}
          <div className="flex-1 overflow-y-auto transition-all duration-300">
            {/* Add bottom padding on small screens only to account for bottom navigation */}
            <div className="pb-20 sm:pb-0 flex justify-center">
              <div className="w-full">{children}</div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation for Mobile */}
        <BottomNavigation user={user} onLogout={logout} />
      </div>
    </ErrorBoundary>
  );
}
