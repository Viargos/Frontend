"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Post } from "@/types/post.types";
import PostCard from "./PostCard";
import { postService } from "@/lib/services/service-factory";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { PostsEmptyIcon } from "@/components/icons";

interface PostsListProps {
  userId?: string; // If provided, shows posts by specific user. If not, shows all posts
  className?: string;
}

export default function PostsList({ userId, className = "" }: PostsListProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let response;
        if (userId) {
          // Fetch posts by specific user
          response = await postService.getPostsByUser(userId);
        } else {
          // For now, we'll use the current user's posts as "all posts"
          // In a real app, you'd have an endpoint for all posts
          response = await postService.getPostsByUser("me");
        }

        if (response.data) {
          setPosts(response.data);
        }
      } catch (err: any) {
        console.error("Error fetching posts:", err);
        setError(err.message || "Failed to load posts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [userId]);

  const handleLike = (postId: string, isLiked: boolean, newCount: number) => {
    // NOTE: API calls are already handled by usePostLike hook
    // This callback only updates the local state with the new values
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likeCount: newCount,
              isLikedByCurrentUser: isLiked,
            }
          : post
      )
    );
  };

  const handleJourneyClick = (journeyId: string) => {
    router.push(`/journey/${journeyId}`);
  };

  if (isLoading) {
    return (
      <div className={`flex justify-center py-8 ${className}`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-red-700 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
<PostsEmptyIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
        <p className="text-gray-500">
          {userId
            ? "This user hasn't shared any posts yet."
            : "Start sharing your travel experiences!"}
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <PostCard
            post={post}
            onLikeChange={handleLike}
            onJourneyClick={handleJourneyClick}
          />
        </motion.div>
      ))}
    </div>
  );
}
