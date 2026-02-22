/**
 * API Client Initialization
 *
 * Initialize the API client with logout handler integration
 * Call this once when the app starts (client-side only)
 */

import { initApiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

/**
 * Initialize API client with Zustand store integration
 * This should be called once in a client component (e.g., root layout client component)
 */
export function initializeApiClient() {
  const clearUser = useAuthStore.getState().clearUser;
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  return initApiClient({
    baseURL,
    logoutOptions: {
      onClearState: clearUser,
      // No need to pass baseURL - logout handler calls frontend Route Handler
    },
  });
}
