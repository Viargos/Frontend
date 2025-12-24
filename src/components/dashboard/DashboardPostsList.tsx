"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useDashboardInfiniteScroll } from "@/hooks/useDashboardInfiniteScroll";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { postService } from "@/lib/services/service-factory";
import PostCard from "@/components/post/PostCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { DashboardFilters } from "@/types/dashboard.types";

interface DashboardPostsListProps {
  className?: string;
  search?: string;
  location?: string;
}

export default function DashboardPostsList({ 
  className = "", 
  search, 
  location 
}: DashboardPostsListProps) {
  const router = useRouter();
  
  const {
    posts,
    isLoading,
    isLoadingMore,
    hasNextPage,
    error,
    loadMorePosts,
    updatePost,
    updateFilters,
    refresh,
  } = useDashboardInfiniteScroll({
    initialFilters: {
      limit: 20,
      search,
      location,
    },
  });

  // Intersection observer for infinite scroll
  const { targetRef } = useIntersectionObserver({
    onIntersect: loadMorePosts,
    enabled: hasNextPage && !isLoadingMore,
    rootMargin: "100px",
  });

  // Store previous filter values to prevent unnecessary updates
  const prevFilters = React.useRef({ search, location });
  
  // Update filters when props change (with proper dependency handling)
  React.useEffect(() => {
    // Only update if the actual values changed
    if (prevFilters.current.search !== search || prevFilters.current.location !== location) {
      const newFilters: Partial<DashboardFilters> = {};
      if (search !== undefined) newFilters.search = search;
      if (location !== undefined) newFilters.location = location;
      
      // Update previous values
      prevFilters.current = { search, location };
      
      // Only update if we have actual filter changes
      if (Object.keys(newFilters).length > 0) {
        updateFilters(newFilters);
      }
    }
  }, [search, location, updateFilters]);

  const handleLike = async (postId: string, isLiked: boolean, newCount: number) => {
    try {
      if (isLiked) {
        await postService.unlikePost(postId);
      } else {
        await postService.likePost(postId);
      }

      // Update the post in the local state
      updatePost(postId, (post) => ({
        ...post,
        likeCount: newCount,
        isLikedByCurrentUser: !isLiked,
      }));
    } catch (err: any) {
      console.error("Error toggling like:", err);
    }
  };

  const handleJourneyClick = (journeyId: string) => {
    router.push(`/journey/${journeyId}`);
  };

  if (isLoading) {
    return (
      <motion.div 
        className={`flex items-center justify-center w-full min-h-[calc(100vh-250px)] py-20 ${className}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <LoadingSpinner size="lg" />
          <motion.p 
            className="text-gray-500 mt-4 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            Loading you feeds...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-red-600 mb-3">{error}</p>
          <button
            onClick={refresh}
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
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.svg
          className="w-16 h-16 mx-auto mb-4 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </motion.svg>
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
            ? "Try adjusting your search filters"
            : "Be the first to share your travel experiences!"}
        </motion.p>
      </motion.div>
    );
  }

  return (
    <div className={className}>
      {/* Posts container with max-width of 700px */}
      <motion.div 
        className="max-w-[700px] mx-auto space-y-6"
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
              ease: "easeOut"
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
        {isLoadingMore && (
          <motion.div 
            className="flex justify-center py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center">
              <LoadingSpinner size="md" />
              <p className="text-gray-500 text-sm mt-2">Loading more posts...</p>
            </div>
          </motion.div>
        )}

        {/* Intersection observer target */}
        {hasNextPage && !isLoadingMore && (
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
                repeatDelay: 3
              }}
            >
              You've reached the end! 🎉
            </motion.p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
