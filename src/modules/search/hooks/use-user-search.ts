'use client';

import type { UserSearchResult } from '@/modules/search/types/search.types';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { searchKeys } from '@/modules/search/query-keys';
import { searchService } from '@/modules/search/services/search.service';

const USER_SEARCH_DEBOUNCE_MS = 350;

function normalizeQuery(query: string): string {
  return query.trim();
}

type UseUserSearchOptions = {
  enabled?: boolean;
};

export function useUserSearch(query: string, options?: UseUserSearchOptions) {
  const enabled = options?.enabled ?? true;
  const normalizedQuery = normalizeQuery(query);
  const [debouncedQuery, setDebouncedQuery] = useState(() => normalizeQuery(query));

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(normalizedQuery);
    }, USER_SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [normalizedQuery]);

  const queryEnabled = enabled && debouncedQuery.length >= 2;

  const usersQuery = useQuery<UserSearchResult[]>({
    enabled: queryEnabled,
    queryFn: ({ signal }) => searchService.searchUsers(debouncedQuery, { signal }),
    queryKey: searchKeys.users(debouncedQuery),
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

  return {
    isDebouncing: normalizedQuery.length >= 2 && debouncedQuery !== normalizedQuery,
    isFetching: usersQuery.isFetching,
    isLoading: usersQuery.isLoading,
    results: usersQuery.data ?? [],
    error: usersQuery.error instanceof Error ? usersQuery.error.message : null,
  };
}
