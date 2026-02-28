'use client';

import type { DashboardFeedModel } from '@/modules/dashboard/types/dashboard.types';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { appConfig } from '@/lib/app-config';
import { dashboardKeys } from '@/modules/dashboard/query-keys';
import { dashboardService } from '@/modules/dashboard/services/dashboard.service';

type DashboardFeedQueryPageParam = string | undefined;

export function useDashboardPosts(initialFeed: DashboardFeedModel | null) {
  const initialData = initialFeed
    ? {
        pageParams: [undefined as DashboardFeedQueryPageParam],
        pages: [initialFeed],
      }
    : undefined;

  const query = useInfiniteQuery({
    getNextPageParam: lastPage => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    initialData,
    initialPageParam: undefined as DashboardFeedQueryPageParam,
    queryFn: ({ pageParam }) =>
      dashboardService.getPostsPage(
        pageParam
          ? { cursor: pageParam }
          : {},
      ),
    queryKey: dashboardKeys.posts(),
    staleTime: appConfig.reactQuery.staleTimeMs,
  });

  const posts = query.data?.pages.flatMap(page => page.posts) ?? [];
  const hasMore = query.hasNextPage ?? false;
  const error = query.error instanceof Error ? query.error.message : null;

  const loadMore = useCallback(async () => {
    if (!hasMore || query.isFetchingNextPage) {
      return;
    }

    await query.fetchNextPage();
  }, [hasMore, query]);

  const retryLoadMore = useCallback(async () => {
    if (!hasMore || query.isFetchingNextPage) {
      return;
    }

    await query.fetchNextPage();
  }, [hasMore, query]);

  return {
    error,
    hasMore,
    isError: query.isError,
    isLoading: query.isLoading || (query.isFetching && !query.data),
    isLoadingMore: query.isFetchingNextPage,
    loadMore,
    posts,
    retry: query.refetch,
    retryLoadMore,
  };
}
