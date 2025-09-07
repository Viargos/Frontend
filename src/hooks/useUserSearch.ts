import { useState, useEffect, useCallback } from 'react';
import { User, UserSearchParams } from '@/types/user.types';
import { userService } from '@/lib/services/service-factory';
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
        limit: 10
      };

      const response = await userService.searchUsers(params);
      
      if (response.statusCode === 10000) {
        setResults(response.data);
      } else {
        setError(response.message);
        setResults([]);
      }
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
