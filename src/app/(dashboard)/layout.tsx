"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth.store";
import { PageLoading } from "@/components/common/Loading";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import LeftSidebar from "@/app/components/LeftSidebar";
import Header from "@/components/home/Header";
import BottomNavigation from "@/components/navigation/BottomNavigation";

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
    if (isAuthenticated === false) {
      router.push("/");
    }
  }, [isAuthenticated, router]);


  // Ensure body overflow is reset when component mounts (after login/redirect)
  useEffect(() => {
    // Reset any potentially stuck overflow styles
    document.body.style.overflow = '';
    
    // Also cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
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
      <div className="h-screen bg-gray-50 flex flex-col">
        {/* Fixed Top Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="sticky top-0 z-50 bg-white border-b border-gray-200"
        >
          <Header user={user} />
        </motion.div>

        {/* Main Layout Container */}
        <div className="flex flex-1 overflow-hidden">
          {/* Fixed Left Sidebar - Full width on lg+, narrow on md */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden sm:block w-16 lg:w-64 bg-gray-100 flex-shrink-0"
          >
            <div className="w-16 lg:w-64 bg-gray-100 h-full">
              <LeftSidebar user={user} onLogout={logout} />
            </div>
          </motion.div>


          {/* Scrollable Main Content Area */}
          <div className="flex-1 overflow-y-auto">
            {/* Add bottom padding on small screens only to account for bottom navigation */}
            <div className="pb-20 sm:pb-0 flex justify-center">
              <div className="w-full">
                {children}
              </div>
            </div>

            {/* Right Sidebar - Hidden on mobile and tablet, shown on desktop */}
            {/* <div className="hidden xl:block w-80 bg-gray-100 p-6 flex-shrink-0">
              <RightSidebar />
            </div> */}
          </div>
        </div>

        {/* Bottom Navigation for Mobile */}
        <BottomNavigation user={user} onLogout={logout} />
      </div>
    </ErrorBoundary>
  );
}
