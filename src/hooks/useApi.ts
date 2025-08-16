'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  retryCount?: number;
  retryDelay?: number;
  transform?: (data: any) => T;
}

/**
 * Custom hook for API calls with loading states and error handling
 */
export function useApi<T = any>(
  apiFunction: () => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const {
    immediate = false,
    onSuccess,
    onError,
    retryCount = 0,
    retryDelay = 1000,
    transform
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (): Promise<T | null> => {
    if (!isMountedRef.current) return null;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiFunction();
      const transformedData = transform ? transform(result) : result;

      if (isMountedRef.current) {
        setState({
          data: transformedData,
          loading: false,
          error: null
        });

        if (onSuccess) {
          onSuccess(transformedData);
        }

        retryCountRef.current = 0;
      }

      return transformedData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';

      if (isMountedRef.current) {
        if (retryCountRef.current < retryCount) {
          retryCountRef.current++;
          setTimeout(() => {
            if (isMountedRef.current) {
              execute();
            }
          }, retryDelay);
          return null;
        }

        setState({
          data: null,
          loading: false,
          error: errorMessage
        });

        if (onError) {
          onError(errorMessage);
        }
      }

      return null;
    }
  }, [apiFunction, onSuccess, onError, retryCount, retryDelay, transform]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null
    });
    retryCountRef.current = 0;
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    reset,
    retry: execute
  };
}

/**
 * Hook for API calls with parameters
 */
export function useApiWithParams<T = any, P = any>(
  apiFunction: (params: P) => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const {
    immediate = false,
    onSuccess,
    onError,
    retryCount = 0,
    retryDelay = 1000,
    transform
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const [lastParams, setLastParams] = useState<P | null>(null);
  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (params: P): Promise<T | null> => {
    if (!isMountedRef.current) return null;

    setLastParams(params);
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiFunction(params);
      const transformedData = transform ? transform(result) : result;

      if (isMountedRef.current) {
        setState({
          data: transformedData,
          loading: false,
          error: null
        });

        if (onSuccess) {
          onSuccess(transformedData);
        }

        retryCountRef.current = 0;
      }

      return transformedData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';

      if (isMountedRef.current) {
        if (retryCountRef.current < retryCount && lastParams) {
          retryCountRef.current++;
          setTimeout(() => {
            if (isMountedRef.current) {
              execute(params);
            }
          }, retryDelay);
          return null;
        }

        setState({
          data: null,
          loading: false,
          error: errorMessage
        });

        if (onError) {
          onError(errorMessage);
        }
      }

      return null;
    }
  }, [apiFunction, onSuccess, onError, retryCount, retryDelay, transform, lastParams]);

  const retry = useCallback(() => {
    if (lastParams) {
      return execute(lastParams);
    }
    return Promise.resolve(null);
  }, [execute, lastParams]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null
    });
    setLastParams(null);
    retryCountRef.current = 0;
  }, []);

  return {
    ...state,
    execute,
    retry,
    reset
  };
}

/**
 * Hook for infinite scrolling/pagination
 */
export function useInfiniteApi<T = any>(
  apiFunction: (page: number, pageSize: number) => Promise<{ data: T[]; hasMore: boolean; total?: number }>,
  pageSize: number = 10,
  options: UseApiOptions<T[]> = {}
) {
  const [state, setState] = useState({
    data: [] as T[],
    loading: false,
    error: null as string | null,
    hasMore: true,
    page: 1,
    total: 0
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadMore = useCallback(async () => {
    if (state.loading || !state.hasMore) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiFunction(state.page, pageSize);

      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          data: [...prev.data, ...result.data],
          loading: false,
          hasMore: result.hasMore,
          page: prev.page + 1,
          total: result.total || prev.total
        }));

        if (options.onSuccess) {
          options.onSuccess(result.data);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';

      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage
        }));

        if (options.onError) {
          options.onError(errorMessage);
        }
      }
    }
  }, [apiFunction, pageSize, state.loading, state.hasMore, state.page, options]);

  const reset = useCallback(() => {
    setState({
      data: [],
      loading: false,
      error: null,
      hasMore: true,
      page: 1,
      total: 0
    });
  }, []);

  const refresh = useCallback(async () => {
    setState({
      data: [],
      loading: false,
      error: null,
      hasMore: true,
      page: 1,
      total: 0
    });
    await loadMore();
  }, [loadMore]);

  useEffect(() => {
    if (options.immediate) {
      loadMore();
    }
  }, [options.immediate, loadMore]);

  return {
    ...state,
    loadMore,
    reset,
    refresh
  };
}
