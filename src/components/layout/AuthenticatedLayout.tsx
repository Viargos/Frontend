"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import LeftSidebar from "@/app/components/LeftSidebar";
import RightSidebar from "@/app/components/RightSidebar";
import Header from "@/components/home/Header";

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

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <div className="fixed top-0 left-0 bottom-0 w-64 bg-gray-100 shadow-xl transform transition-transform duration-300 ease-in-out">
              {/* Close Button */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors"
                  aria-label="Close menu"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              
              {/* Sidebar Content */}
              <div className="h-full overflow-y-auto">
                <LeftSidebar 
                  user={user} 
                  onLogout={logout} 
                  onNavigate={() => setIsMobileSidebarOpen(false)}
                />
              </div>
            </div>
          </div>
        )}

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
