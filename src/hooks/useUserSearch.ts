import { useState, useEffect, useCallback } from 'react';
import { User, UserSearchParams } from '@/types/user.types';
import { getApiClient } from '@/lib/api';
import { useDebounce } from './useDebounce';

export function useUserSearch(query: string, delay: number = 300) {
  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debouncedQuery = useDebounce(query, delay);

  const searchUsers = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params: UserSearchParams = {
        q: searchQuery.trim(),
        limit: 10,
      };

      const client = getApiClient();
      const searchParams = new URLSearchParams({
        q: params.q,
        limit: String(params.limit ?? 10),
      });

      const response = await client.get<any>(
        `/api/users/search/quick?${searchParams.toString()}`,
      );

      let users: User[] = [];

      if (Array.isArray(response)) {
        users = response as User[];
      } else if (Array.isArray(response?.data)) {
        users = response.data as User[];
      } else if (Array.isArray(response?.users)) {
        users = response.users as User[];
      }

      setResults(users);
    } catch (err: any) {
      setError(err.message || 'Failed to search users');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    searchUsers(debouncedQuery);
  }, [debouncedQuery, searchUsers]);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    isLoading,
    error,
    clearResults
  };
}
