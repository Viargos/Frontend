import { QueryClient } from '@tanstack/react-query';
import { appConfig } from '@/lib/app-config';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: appConfig.reactQuery.gcTimeMs,
        refetchOnWindowFocus: appConfig.reactQuery.refetchOnWindowFocus,
        retry: appConfig.reactQuery.retry,
        staleTime: appConfig.reactQuery.staleTimeMs,
      },
    },
  });
}
