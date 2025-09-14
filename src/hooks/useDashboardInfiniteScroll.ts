import { useState, useEffect, useCallback, useRef } from 'react';
import { dashboardService } from '@/lib/services/service-factory';
import { DashboardFilters, DashboardPostsState } from '@/types/dashboard.types';
import { Post } from '@/types/post.types';

interface UseDashboardInfiniteScrollOptions {
  initialFilters?: DashboardFilters;
  enabled?: boolean;
}

export function useDashboardInfiniteScroll(options: UseDashboardInfiniteScrollOptions = {}) {
  const { initialFilters = { limit: 20 }, enabled = true } = options;
  
  const [state, setState] = useState<DashboardPostsState>({
    posts: [],
    isLoading: true,
    isLoadingMore: false,
    hasNextPage: true,
    nextCursor: null,
    error: null,
  });

  const [filters, setFilters] = useState<DashboardFilters>(initialFilters);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isInitialLoadRef = useRef(true);
  const filtersRef = useRef<DashboardFilters>(initialFilters);

  // Load initial posts
  const loadInitialPosts = useCallback(async (searchFilters?: DashboardFilters) => {
    if (!enabled) return;

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      posts: [], // Clear existing posts for new search/filter
      nextCursor: null,
      hasNextPage: true,
    }));

    try {
      abortControllerRef.current = new AbortController();
      
      const filtersToUse = searchFilters || filtersRef.current;
      const response = await dashboardService.getDashboardPosts({
        ...filtersToUse,
        cursor: undefined, // Always start fresh
      });

      if (response.data) {
        setState(prev => ({
          ...prev,
          posts: Array.isArray(response.data.posts) ? response.data.posts : [],
          nextCursor: response.data.nextCursor,
          hasNextPage: response.data.hasNextPage,
          isLoading: false,
        }));
      }
      
      isInitialLoadRef.current = false;
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        setState(prev => ({
          ...prev,
          error: error.message || 'Failed to load posts',
          isLoading: false,
        }));
      }
    }
  }, [enabled]);

  // Load more posts for infinite scroll
  const loadMorePosts = useCallback(async () => {
    if (!enabled || state.isLoadingMore || !state.hasNextPage || !state.nextCursor) return;

    setState(prev => ({ ...prev, isLoadingMore: true, error: null }));

    try {
      const response = await dashboardService.getDashboardPosts({
        ...filtersRef.current,
        cursor: state.nextCursor,
      });

      if (response.data && Array.isArray(response.data.posts)) {
        setState(prev => ({
          ...prev,
          posts: [...prev.posts, ...response.data.posts],
          nextCursor: response.data.nextCursor,
          hasNextPage: response.data.hasNextPage,
          isLoadingMore: false,
        }));
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to load more posts',
        isLoadingMore: false,
      }));
    }
  }, [enabled, state.isLoadingMore, state.hasNextPage, state.nextCursor]);

  // Update filters and reload
  const updateFilters = useCallback((newFilters: Partial<DashboardFilters>) => {
    const updatedFilters = { ...filtersRef.current, ...newFilters };
    
    // Only reload if filters actually changed
    const hasChanged = Object.keys(newFilters).some(key => {
      const typedKey = key as keyof DashboardFilters;
      return filtersRef.current[typedKey] !== newFilters[typedKey];
    });
    
    if (hasChanged) {
      filtersRef.current = updatedFilters;
      setFilters(updatedFilters);
      loadInitialPosts(updatedFilters);
    }
  }, [loadInitialPosts]);

  // Refresh data
  const refresh = useCallback(() => {
    loadInitialPosts();
  }, [loadInitialPosts]);

  // Update a post in the local state (for likes, etc.)
  const updatePost = useCallback((postId: string, updater: (post: Post) => Post) => {
    setState(prev => ({
      ...prev,
      posts: prev.posts.map(post => 
        post.id === postId ? updater(post) : post
      ),
    }));
  }, []);

  // Remove a post from local state
  const removePost = useCallback((postId: string) => {
    setState(prev => ({
      ...prev,
      posts: prev.posts.filter(post => post.id !== postId),
    }));
  }, []);

  // Initial load
  useEffect(() => {
    if (enabled && isInitialLoadRef.current) {
      loadInitialPosts();
    }
  }, [enabled, loadInitialPosts]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Update filtersRef when filters change
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  return {
    ...state,
    filters,
    loadMorePosts,
    updateFilters,
    refresh,
    updatePost,
    removePost,
  };
}
