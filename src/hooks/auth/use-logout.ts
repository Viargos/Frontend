'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { AuthApi } from '@/lib/api';

/**
 * Logout hook - handles user-initiated logout
 *
 * Responsibilities:
 * - Clear Zustand store immediately
 * - Call AuthApi to clear cookies (cookie-based auth)
 * - Navigate to homepage
 * - Handle loading state
 *
 * Usage:
 * const { logout, isPending } = useLogout();
 * <button onClick={logout} disabled={isPending}>Logout</button>
 */
export function useLogout() {
  const router = useRouter();
  const clearUser = useAuthStore(state => state.clearUser);
  const [isPending, setIsPending] = useState(false);

  const logout = async () => {
    setIsPending(true);

    try {
      // Clear client state immediately (optimistic update)
      clearUser();

      // Call AuthApi to clear cookies (uses Route Handler internally)
      await AuthApi.signout();

      // Navigate to homepage
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate even on error - user should be able to logout
      router.push('/');
    } finally {
      setIsPending(false);
    }
  };

  return {
    logout,
    isPending,
  };
}
