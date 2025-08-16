"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { PageLoading } from '@/components/common/Loading';

interface AuthInitializerProps {
  children: React.ReactNode;
}

/**
 * AuthInitializer - Handles authentication state initialization for the entire app
 * This runs once at the root level and initializes auth state from stored tokens
 */
export default function AuthInitializer({ children }: AuthInitializerProps) {
  const { initialize } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await initialize();
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [initialize]);

  // Show loading while initializing auth state
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <PageLoading text="Loading..." />
      </div>
    );
  }

  return <>{children}</>;
}
