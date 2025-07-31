"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isAuthenticated, getProfile } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated on mount
    const token = localStorage.getItem("token");
    if (token && !user) {
      getProfile();
    } else if (!token) {
      router.push("/");
    }
  }, [getProfile, user, router]);

  // Show loading state while checking authentication
  if (isAuthenticated === null || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not authenticated, don't render children
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
