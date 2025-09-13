"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Post } from "@/types/post.types";
import PostCard from "./PostCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/store/auth.store";
import { postService } from "@/lib/services/service-factory";

interface GuestPostsListProps {
  className?: string;
  maxPosts?: number;
}

export default function GuestPostsList({
  className = "",
  maxPosts = 5,
}: GuestPostsListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const { openLogin, openSignup } = useAuthStore();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // For guests, we'll fetch posts without authentication
        // You might need to create a public endpoint for this
        const response = await postService.getPublicPosts(maxPosts + 2); // Get a few extra

        if (response.data) {
          setPosts(response.data.slice(0, maxPosts));
        }
      } catch (err: any) {
        console.error("Error fetching guest posts:", err);
        setError("Failed to load posts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [maxPosts]);

  // Show auth prompt when user scrolls to the end
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Show auth prompt when user scrolls 80% down
      if (scrollPosition >= documentHeight * 0.8 && posts.length >= maxPosts) {
        setShowAuthPrompt(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [posts.length, maxPosts]);

  const handleJourneyClick = (journeyId: string) => {
    // For guests, show auth prompt when trying to view journey
    setShowAuthPrompt(true);
  };

  const handleCommentClick = (postId: string) => {
    // For guests, show auth prompt when trying to comment
    setShowAuthPrompt(true);
  };

  const handleLikeChange = (
    postId: string,
    isLiked: boolean,
    newCount: number
  ) => {
    // For guests, show auth prompt when trying to like
    setShowAuthPrompt(true);
  };

  if (isLoading) {
    return (
      <div className={`flex justify-center py-12 ${className}`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <svg
          className="w-16 h-16 mx-auto mb-4 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No posts available
        </h3>
        <p className="text-gray-500 mb-4">
          Join Viargos to start sharing your travel experiences!
        </p>
        <div className="flex justify-center space-x-4">
          <Button variant="primary" onClick={openSignup}>
            Sign Up
          </Button>
          <Button variant="outline" onClick={openLogin}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Posts List */}
      <AnimatePresence>
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <PostCard
              post={post}
              onLikeChange={handleLikeChange}
              onCommentClick={handleCommentClick}
              onJourneyClick={handleJourneyClick}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Auth Prompt */}
      <AnimatePresence>
        {showAuthPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8 text-center"
          >
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Want to see more?
              </h3>
              <p className="text-gray-600 mb-6">
                Join Viargos to discover unlimited travel experiences, share
                your own journeys, and connect with fellow travelers!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="primary"
                  onClick={openSignup}
                  className="flex-1 sm:flex-none"
                >
                  Sign Up Free
                </Button>
                <Button
                  variant="outline"
                  onClick={openLogin}
                  className="flex-1 sm:flex-none"
                >
                  Sign In
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Or continue exploring our{" "}
                <button
                  onClick={() => (window.location.href = "/explore")}
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Explore page
                </button>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post Limit Reached */}
      {posts.length >= maxPosts && !showAuthPrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center"
        >
          <h4 className="font-medium text-gray-900 mb-2">
            You've reached the preview limit
          </h4>
          <p className="text-gray-600 text-sm mb-4">
            Sign up to see unlimited posts and join the community!
          </p>
          <div className="flex justify-center space-x-3">
            <Button variant="primary" size="sm" onClick={openSignup}>
              Sign Up
            </Button>
            <Button variant="outline" size="sm" onClick={openLogin}>
              Sign In
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
