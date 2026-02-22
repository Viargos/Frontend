/**
 * Simplified Auth Store - Cookie-Based Authentication
 *
 * Responsibilities:
 * - Store user data for UI display only (DTO contract)
 * - Track initialization state (for session rehydration)
 * - Provide isAuthenticated computed value
 * - Expose setUser and clearUser actions
 *
 * MUST NOT:
 * - Store tokens (cookies handle this)
 * - Call APIs (API client handles this)
 * - Handle redirects (logout handler handles this)
 * - Validate authentication (backend cookie is source of truth)
 */

import { create } from 'zustand';
import { UserDto } from '@/lib/dtos/user/user.dto';
import { SigninUserDto } from '@/lib/dtos/auth/signin-user.dto';

/** User shape from /me (UserDto) or from signin (SigninUserDto) */
export type AuthUser = UserDto | SigninUserDto;

interface AuthState {
  user: AuthUser | null;
  isInitializing: boolean;
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
  setInitializing: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>(set => ({
  // Initial state
  user: null,
  isInitializing: true, // Start as true, set to false after rehydration

  // Set user data (called after successful login/verification)
  setUser: (user: AuthUser) => {
    set({ user });
  },

  // Clear user data (called on logout)
  clearUser: () => {
    set({ user: null });
  },

  // Set initialization state
  setInitializing: (value: boolean) => {
    set({ isInitializing: value });
  },
}));

/**
 * Hook to check if user is authenticated
 * Computed: isAuthenticated = user !== null
 */
export function useIsAuthenticated() {
  return useAuthStore(state => state.user !== null);
}
