"use client";

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

  if (!user) {
    return null; // This should not happen as this component is only for authenticated users
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <Header user={user} />

      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-64 bg-gray-100 min-h-screen">
          <LeftSidebar user={user} onLogout={logout} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          <div className="flex-1 p-6">{children}</div>

          {/* Right Sidebar */}
          <div className="w-80 bg-gray-100 p-6">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
