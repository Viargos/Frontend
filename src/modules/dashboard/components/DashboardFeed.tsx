'use client';

import type { DashboardParityState } from '@/modules/dashboard/constants/dashboard-parity.types';
import type { DashboardFeedModel } from '@/modules/dashboard/types/dashboard.types';
import * as motion from 'framer-motion/client';
import { useEffect, useRef } from 'react';
import { useIntersectionObserver } from '@/modules/common/hooks';
import { useDashboardPosts } from '@/modules/dashboard/hooks/use-dashboard-posts';
import { DashboardFeedSkeleton } from './DashboardFeedSkeleton';
import { DashboardPostCard } from './DashboardPostCard';

type DashboardFeedProps = {
  initialFeed: DashboardFeedModel | null;
  parityState?: DashboardParityState;
};

export const DashboardFeed = (props: DashboardFeedProps) => {
  const { initialFeed, parityState } = props;
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const {
    posts,
    hasMore,
    isLoadingMore,
    loadMore,
    error,
    isError,
    isLoading,
    retry,
    retryLoadMore,
  } = useDashboardPosts(initialFeed);

  useIntersectionObserver(sentinelRef, {
    enabled: !parityState && hasMore && !isLoading && posts.length > 0,
    onIntersect: () => {
      void loadMore();
    },
    rootMargin: '120px',
    threshold: 0,
  });

  useEffect(() => {
    if (parityState) {
      return;
    }

    const scrollContainer = document.querySelector<HTMLElement>('[data-dashboard-scroll-container]');
    scrollContainer?.scrollTo({ behavior: 'auto', top: 0 });
  }, [parityState]);

  if (isLoading && posts.length === 0) {
    return <DashboardFeedSkeleton embedded />;
  }

  if (isError && posts.length === 0) {
    return (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="py-16 text-center"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="mb-3 text-red-700">{error ?? 'Failed to load posts'}</p>
          <button
            className="rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
            onClick={() => void retry()}
            type="button"
          >
            Try again
          </button>
        </div>
      </motion.div>
    );
  }

  if (posts.length === 0) {
    return (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="py-16 text-center"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h3 className="mb-2 text-lg font-medium text-gray-900">No posts found</h3>
        <p className="text-gray-500">Be the first to share your travel experiences!</p>
      </motion.div>
    );
  }

  return (
    <div className="w-full">
      <motion.div
        animate={{ opacity: 1 }}
        className="mx-auto max-w-[680px] space-y-5"
        initial={{ opacity: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{
              duration: 0.5,
              delay: index * 0.08,
              ease: 'easeOut',
            }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
          >
            <DashboardPostCard post={post} />
          </motion.div>
        ))}

        {error && posts.length > 0
          ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <div className="flex items-center justify-between gap-3">
                  <span>{error}</span>
                  {hasMore
                    ? (
                        <button
                          className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-red-700"
                          onClick={() => void retryLoadMore()}
                          type="button"
                        >
                          Retry
                        </button>
                      )
                    : null}
                </div>
              </div>
            )
          : null}

        {isLoadingMore
          ? (
              <motion.div animate={{ opacity: 1, y: 0 }} className="flex justify-center py-8" initial={{ opacity: 0, y: 20 }} transition={{ duration: 0.4 }}>
                <div className="text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
                  <span className="sr-only">Fetching more posts</span>
                </div>
              </motion.div>
            )
          : null}

        {hasMore && !isLoadingMore
          ? (
              <div ref={sentinelRef} className="flex h-[88px] items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-gray-500" />
              </div>
            )
          : null}

        {!hasMore && posts.length > 0
          ? (
              <motion.div animate={{ opacity: 1, y: 0 }} className="py-8 text-center" initial={{ opacity: 0, y: 10 }} transition={{ duration: 0.4 }}>
                <motion.p
                  animate={{ scale: [1, 1.05, 1] }}
                  className="text-gray-500"
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
                >
                  You&apos;ve reached the end!
                </motion.p>
              </motion.div>
            )
          : null}
      </motion.div>
    </div>
  );
};
