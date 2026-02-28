'use client';

import type { AuthUser } from '@/modules/auth/types/auth.types';
import { useQuery } from '@tanstack/react-query';
import { authQueryKeys } from '@/modules/auth/query-keys';
import { authService } from '@/modules/auth/services/auth.service';

async function getProfile(): Promise<AuthUser> {
  return authService.profile();
}

export function useAuthProfile(hasSession: boolean) {
  return useQuery({
    enabled: hasSession,
    gcTime: 10 * 60 * 1000,
    queryFn: getProfile,
    queryKey: authQueryKeys.profile(),
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
}
