/**
 * Auth Store Hook
 * Encapsulates Zustand store access pattern
 */

import { useAuthStore } from '@/store/auth.store';

/**
 * Hook to access auth store
 * Returns all auth state and actions
 */
export function useAuthStoreHook() {
  return useAuthStore();
}

/**
 * Hook to get current user
 * Returns user object or null
 */
export function useCurrentUser() {
  return useAuthStore(state => state.user);
}

/**
 * Hook to check authentication status
 * Returns boolean indicating if user is authenticated
 */
export function useIsAuthenticated() {
  return useAuthStore(state => state.user !== null);
}
