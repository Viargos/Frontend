'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { usePostsInfiniteQuery } from '@/hooks/api/use-posts-query';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import PostCard from '@/components/post/PostCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { FolderDocumentIcon } from '@/components/icons';
import { Post } from '@/types/post.types';

interface DashboardFeedProps {
  initialData: Post[];
  className?: string;
  search?: string;
  location?: string;
}

/**
 * DashboardFeed - Client Component
 * 
 * Responsibilities:
 * - Hydrate React Query with initialData from Server Component
 * - Manage infinite scroll pagination
 * - Render posts list
 * 
 * MUST NOT:
 * - Fetch initial data (Server Component does this)
 * - Handle auth errors (API client does this)
 * - Implement retry logic (API client does this)
 */
export default function DashboardFeed({
  initialData,
  className = '',
  search,
  location,
}: DashboardFeedProps) {
  const router = useRouter();

  // Use infinite query with initial data from Server Component
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = usePostsInfiniteQuery({
    initialData: initialData.length > 0 ? {
      pages: [{ posts: initialData, nextCursor: null, hasNextPage: true }],
      pageParams: [null],
    } : undefined,
    filters: { search, location },
  });

  // Flatten all pages into a single posts array
  const posts = data?.pages.flatMap(page => page.posts) || initialData;

  // Intersection observer for infinite scroll
  const { targetRef } = useIntersectionObserver({
    onIntersect: () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    enabled: hasNextPage && !isFetchingNextPage,
    rootMargin: '100px',
  });

  const handleLike = (postId: string, isLiked: boolean, newCount: number) => {
    // Note: Like mutation is handled by PostCard component
    // This callback is for local state updates if needed
  };

  const handleJourneyClick = (journeyId: string) => {
    router.push(`/journey/${journeyId}`);
  };

  // Show loading only if we have no initial data and are loading
  if (isLoading && initialData.length === 0) {
    return (
      <motion.div
        className={`flex items-center justify-center w-full min-h-[calc(100vh-250px)] py-20 ${className}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <LoadingSpinner size="lg" />
          <motion.p
            className="text-gray-500 mt-4 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            Loading your feeds...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-red-600 mb-3">
            {error instanceof Error ? error.message : 'Failed to load posts'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <motion.div
        className={`text-center py-16 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <FolderDocumentIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        </motion.div>
        <motion.h3
          className="text-lg font-medium text-gray-900 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          No posts found
        </motion.h3>
        <motion.p
          className="text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {search || location
            ? 'Try adjusting your search filters'
            : 'Be the first to share your travel experiences!'}
        </motion.p>
      </motion.div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <motion.div
        className="max-w-[680px] mx-auto space-y-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: index * 0.08,
              ease: 'easeOut',
            }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
          >
            <PostCard
              post={post}
              onLikeChange={handleLike}
              onJourneyClick={handleJourneyClick}
            />
          </motion.div>
        ))}

        {/* Loading more indicator */}
        {isFetchingNextPage && (
          <motion.div
            className="flex justify-center py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center">
              <LoadingSpinner size="md" />
              <p className="text-gray-500 text-sm mt-2">
                Loading more posts...
              </p>
            </div>
          </motion.div>
        )}

        {/* Intersection observer target */}
        {hasNextPage && !isFetchingNextPage && (
          <div
            ref={targetRef}
            className="h-10 flex items-center justify-center"
          >
            <div className="text-gray-400 text-sm">Loading more posts...</div>
          </div>
        )}

        {/* End of posts message */}
        {!hasNextPage && posts.length > 0 && (
          <motion.div
            className="text-center py-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.p
              className="text-gray-500"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            >
              You&apos;ve reached the end! 🎉
            </motion.p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
