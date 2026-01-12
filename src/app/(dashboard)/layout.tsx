'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { PageLoading } from '@/components/common/Loading';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import LeftSidebar from '@/app/components/LeftSidebar';
import Header from '@/components/home/Header';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import { AnimatedHeader } from './components/AnimatedHeader';
import { AnimatedSidebar } from './components/AnimatedSidebar';

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
          {/* Fixed Left Sidebar - Full width on lg+, narrow on md */}
          <AnimatedSidebar>
            <LeftSidebar user={user} onLogout={logout} />
          </AnimatedSidebar>

          {/* Scrollable Main Content Area */}
          <div className="flex-1 overflow-y-auto">
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
