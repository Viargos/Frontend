/**
 * useSession Hook
 *
 * Convenient hook for accessing session state in components.
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, isInitializing } = useSession();
 *
 *   if (isInitializing) {
 *     return <LoadingSkeleton />;
 *   }
 *
 *   if (!isAuthenticated) {
 *     return <LoginPrompt />;
 *   }
 *
 *   return <div>Welcome, {user.username}!</div>;
 * }
 * ```
 */

import { useAuthStore } from '@/store/auth.store';
import type { AuthUser } from '@/store/auth.store';

export interface UseSessionReturn {
  /**
   * Current user data (null if not authenticated)
   */
  user: AuthUser | null;

  /**
   * Whether the app is still loading user data on mount
   * Use this to show loading skeletons instead of "Not logged in" flash
   */
  isInitializing: boolean;

  /**
   * Whether the user is authenticated (user !== null)
   * Computed from user state
   */
  isAuthenticated: boolean;
}

/**
 * Hook to access current session state
 *
 * Returns user data, authentication status, and initialization state.
 * All values are derived from Zustand store.
 *
 * @returns Session state object
 */
export function useSession(): UseSessionReturn {
  const user = useAuthStore(state => state.user);
  const isInitializing = useAuthStore(state => state.isInitializing);

  return {
    user,
    isInitializing,
    isAuthenticated: user !== null,
  };
}
