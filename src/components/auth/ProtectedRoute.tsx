"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { PageLoading } from "@/components/common/Loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * ProtectedRoute - Component-level route protection
 * Alternative to layout-based protection for specific components
 * 
 * Usage:
 * <ProtectedRoute>
 *   <YourProtectedComponent />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({ 
  children, 
  fallback,
  redirectTo = "/" 
}: ProtectedRouteProps) {
  const { user } = useAuthStore();
  const router = useRouter();
  const isAuthenticated = user !== null;

  useEffect(() => {
    // Redirect unauthenticated users
    if (!isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);

  // Show loading if redirecting or no user
  if (!isAuthenticated || !user) {
    return fallback || <PageLoading text="Redirecting..." />;
  }

  return <>{children}</>;
}
