'use client';

import type { AuthSession, AuthUser } from '@/modules/auth/types/auth.types';
import { useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { useAuthProfile } from '@/modules/auth/hooks/use-auth-profile';
import { authQueryKeys } from '@/modules/auth/query-keys';
import { authService } from '@/modules/auth/services/auth.service';
import { PUBLIC_PATH_PREFIXES } from '@/modules/common/constants';

const INITIAL_AUTH_SESSION: AuthSession = {
  isAuthenticated: false,
  isInitializing: true,
  user: null,
};

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATH_PREFIXES.some((prefix) => {
    if (prefix === '/') {
      return pathname === '/';
    }

    return pathname.startsWith(prefix);
  });
}

export function useAuthSession() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const cachedProfile = queryClient.getQueryData<AuthUser | null>(authQueryKeys.profile());
  const hasSession = Boolean(cachedProfile) || !isPublicPath(pathname ?? '/');
  const {
    data: profile,
    isError,
    isLoading,
    isPending,
  } = useAuthProfile(hasSession);

  const session = useMemo<AuthSession>(() => {
    if (!hasSession) {
      return {
        isAuthenticated: false,
        isInitializing: false,
        user: null,
      };
    }

    if (isLoading || isPending) {
      return INITIAL_AUTH_SESSION;
    }

    if (profile) {
      return {
        isAuthenticated: true,
        isInitializing: false,
        user: profile,
      };
    }

    if (isError) {
      return {
        isAuthenticated: false,
        isInitializing: false,
        user: null,
      };
    }

    return {
      isAuthenticated: false,
      isInitializing: false,
      user: null,
    };
  }, [hasSession, isError, isLoading, isPending, profile]);

  const setAuthenticatedUser = useCallback((user: AuthUser) => {
    queryClient.setQueryData(authQueryKeys.profile(), user);
  }, [queryClient]);

  const clearSession = useCallback(() => {
    queryClient.setQueryData(authQueryKeys.profile(), null);
  }, [queryClient]);

  const signOut = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  return {
    clearSession,
    session,
    setAuthenticatedUser,
    signOut,
  };
}
