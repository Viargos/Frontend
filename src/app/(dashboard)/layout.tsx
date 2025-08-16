"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { PageLoading } from "@/components/common/Loading";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import LeftSidebar from "@/app/components/LeftSidebar";
import RightSidebar from "@/app/components/RightSidebar";
import Header from "@/components/home/Header";
import AnimatedSidebar from "@/components/layout/AnimatedSidebar";

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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    // Redirect unauthenticated users to home
    if (isAuthenticated === false) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // Note: Body overflow is now managed by AnimatedSidebar component to avoid conflicts

  // Ensure body overflow is reset when component mounts (after login/redirect)
  useEffect(() => {
    // Reset any potentially stuck overflow styles
    document.body.style.overflow = '';
    
    // Also cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Close mobile sidebar on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show loading while auth state is being determined
  if (isAuthenticated === null) {
    return <PageLoading text="Loading..." />;
  }

  // Show loading if redirecting
  if (!isAuthenticated || !user) {
    return <PageLoading text="Redirecting..." />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Top Header with integrated mobile menu */}
        <Header user={user} onMobileMenuOpen={() => setIsMobileSidebarOpen(true)} />

        <div className="flex flex-col lg:flex-row">
          {/* Desktop Left Sidebar - Sticky Position */}
          <div className="hidden lg:block w-64 bg-gray-100 flex-shrink-0">
            <div className="sticky top-0 w-64 h-screen bg-gray-100">
              <LeftSidebar user={user} onLogout={logout} />
            </div>
          </div>

          {/* Mobile Sidebar with Animation */}
          <AnimatedSidebar
            isOpen={isMobileSidebarOpen}
            onClose={() => setIsMobileSidebarOpen(false)}
            title="Viargos"
            position="left"
            width="w-64"
            showOnDesktop={false}
          >
            <LeftSidebar 
              user={user} 
              onLogout={logout} 
              onNavigate={() => setIsMobileSidebarOpen(false)}
            />
          </AnimatedSidebar>

          {/* Main Content */}
          <div className="flex-1 flex flex-col xl:flex-row">
            {children}

            {/* Right Sidebar - Hidden on mobile and tablet, shown on desktop */}
            {/* <div className="hidden xl:block w-80 bg-gray-100 p-6 flex-shrink-0">
              <RightSidebar />
            </div> */}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
