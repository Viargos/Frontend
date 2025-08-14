"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import LeftSidebar from "@/app/components/LeftSidebar";
import RightSidebar from "@/app/components/RightSidebar";
import Header from "@/components/home/Header";
import AnimatedSidebar from './AnimatedSidebar';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  const { user, logout } = useAuthStore();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Handle body scroll lock when mobile sidebar is open
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileSidebarOpen]);

  // Close mobile sidebar on route change (if you add routing)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!user) {
    return null; // This should not happen as this component is only for authenticated users
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header with integrated mobile menu */}
      <Header user={user} onMobileMenuOpen={() => setIsMobileSidebarOpen(true)} />

      <div className="flex flex-col lg:flex-row">
        {/* Desktop Left Sidebar */}
        <div className="hidden lg:block w-64 bg-gray-100 min-h-screen flex-shrink-0">
          <LeftSidebar user={user} onLogout={logout} />
        </div>

      {/* Mobile Sidebar with Animation */}
      <AnimatedSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        title="Navigation"
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
          <div className="flex-1 p-4 sm:p-6 max-w-none">{children}</div>

          {/* Right Sidebar - Hidden on mobile and tablet, shown on desktop */}
          <div className="hidden xl:block w-80 bg-gray-100 p-6 flex-shrink-0">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
