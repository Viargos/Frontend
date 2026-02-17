'use client';

import { useEffect } from 'react';
import { initializeApiClient } from '@/lib/api/init';
import { useRedirectHandler } from '@/hooks/auth/use-redirect-handler';
import { rehydrateSession } from '@/lib/auth/session';
import { useAuthStore } from '@/store/auth.store';

interface AuthInitializerProps {
  children: React.ReactNode;
}

/**
 * AuthInitializer - bootstraps global auth-related infrastructure.
 *
 * Responsibilities:
 * - Initialize the API client (for authenticated fetches)
 * - Rehydrate user session on page load (restore user state after refresh)
 * - Handle global redirect logic (e.g. ?redirect=/dashboard)
 *
 * Session Rehydration:
 * - On mount, check if auth cookies exist
 * - If yes, fetch user data from /api/user/me
 * - Update Zustand store with user data
 * - Set isInitializing to false when done
 *
 * This prevents "Not logged in" flash on page refresh.
 */
export default function AuthInitializer({ children }: AuthInitializerProps) {
  const setUser = useAuthStore(state => state.setUser);
  const setInitializing = useAuthStore(state => state.setInitializing);

  // Handle ?redirect=... → store + auto-open login modal, then clean URL
  useRedirectHandler();

  // Initialize API client and rehydrate session on mount
  useEffect(() => {
    console.log('🚀 [AuthInitializer] Starting...');

    const initialize = async () => {
      try {
        // Initialize API client
        initializeApiClient();
        console.log('🚀 [AuthInitializer] API client initialized');

        // Rehydrate user session (if cookies exist)
        const user = await rehydrateSession();
        console.log('🚀 [AuthInitializer] Rehydration result:', user ? `User: ${user.email}` : 'No user');

        if (user) {
          // User is authenticated, update store
          setUser(user);
          console.log('🚀 [AuthInitializer] User set in store');
        }
      } catch (error) {
        console.error('❌ [AuthInitializer] Error:', error);
        // Don't throw - gracefully degrade to "not logged in" state
      } finally {
        // Always set initializing to false, even on error
        console.log('🚀 [AuthInitializer] Setting isInitializing = false');
        setInitializing(false);
      }
    };

    initialize();
  }, [setUser, setInitializing]);

  // Render children immediately - UI can show loading state via isInitializing
  return <>{children}</>;
}

