"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Post } from "@/types/post.types";
import { PostApi, ApiError } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";
import { formatDistanceToNow } from "date-fns";
import EditIcon from "@/components/icons/EditIcon";
import DeleteIcon from "@/components/icons/DeleteIcon";
import JourneyIcon from "@/components/icons/JourneyIcon";
import HeartIcon from "@/components/icons/HeartIcon";
import ChatIcon from "@/components/icons/ChatIcon";
import EditPostModal from "@/components/post/EditPostModal";
import MediaCarousel from "@/components/post/MediaCarousel";
import { PostsEmptyIcon, ImageIcon } from "@/components/icons";

interface ProfilePostsGridProps {
  userId?: string;
  className?: string;
  onEditPost?: (postId: string) => void;
  onDeletePost?: (postId: string) => void;
}

export default function ProfilePostsGrid({
  userId,
  className = "",
  onEditPost,
  onDeletePost,
}: ProfilePostsGridProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Log posts state changes
  useEffect(() => {
    console.log("[STATE_POSTS_COUNT]", {
      count: posts.length,
      posts: posts
    });
  }, [posts]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const list = userId
          ? await PostApi.listByUser(userId)
          : await PostApi.listByUser("me");

        if (Array.isArray(list)) {
          setPosts(list as Post[]);
        }
      } catch (err) {
        const message = err instanceof ApiError ? err.getUserMessage() : err instanceof Error ? err.message : "Failed to load posts";
        console.error("Error fetching posts:", err);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [userId]);

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      setDeletingPostId(postId);

      await PostApi.delete(postId);

      // Remove post from local state
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));

      // Call parent callback if provided
      onDeletePost?.(postId);

    } catch (err) {
      const message = err instanceof ApiError ? err.getUserMessage() : err instanceof Error ? err.message : "Unknown error";
      console.error("Error deleting post:", err);
      alert(`Failed to delete post: ${message}`);
    } finally {
      setDeletingPostId(null);
    }
  };

  const handleEditPost = (postId: string) => {
    console.log("Edit post clicked:", postId);
    const post = posts.find((p) => p.id === postId);
    if (post) {
      setEditingPost(post);
      setShowEditModal(true);
    }
    onEditPost?.(postId);
  };

  const handleEditSuccess = (updatedPost: Post) => {
    console.log("Post updated successfully:", updatedPost);
    // Update the post in the local state
    setPosts((prevPosts) =>
      prevPosts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
    setShowEditModal(false);
    setEditingPost(null);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingPost(null);
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
        <PostsEmptyIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
        <p className="text-gray-500">Start sharing your travel experiences!</p>
      </div>
    );
  }

  // Log render count
  console.log("[RENDER_POSTS_COUNT]", {
    count: posts.length,
    posts: posts
  });

  return (
    <>
      <div className={`w-full ${className}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          <AnimatePresence>
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Post Image/Media */}
                <div className="relative aspect-square bg-gray-100">
                  {post.media && post.media.length > 0 ? (
                    <MediaCarousel media={post.media} />
                  ) : (
                    // Placeholder for posts without media
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-xs text-gray-500">Text Post</p>
                      </div>
                    </div>
                  )}

                  {/* Mobile Action Buttons - Always visible on mobile, positioned at top-left to avoid media counter */}
                  <div className="sm:hidden absolute top-2 left-2 flex items-center gap-2 z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPost(post.id);
                      }}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-lg text-[#160E53]"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePost(post.id);
                      }}
                      disabled={deletingPostId === post.id}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-lg text-red-500 disabled:opacity-50"
                    >
                      {deletingPostId === post.id ? (
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <DeleteIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Desktop Overlay with actions - appears on hover (hidden on mobile) */}
                  <div className="hidden sm:flex absolute inset-0 bg-white/0 group-hover:bg-white/30 backdrop-blur-0 group-hover:backdrop-blur-md transition-all duration-300 items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditPost(post.id)}
                        className="bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 border border-white/50 shadow-lg"
                      >
                        <EditIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                        disabled={deletingPostId === post.id}
                        className="bg-red-500/80 backdrop-blur-sm hover:bg-red-500 text-white border border-red-400/50 shadow-lg"
                      >
                        {deletingPostId === post.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <DeleteIcon className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Post Info */}
                <div className="p-3">
                  {/* Journey indicator */}
                  {post.journey && (
                    <div className="flex items-center space-x-1 mb-2">
                      <JourneyIcon className="w-3 h-3 text-blue-600" />
                      <span className="text-xs text-blue-600 font-medium truncate">
                        {post.journey.title}
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-sm text-gray-900 line-clamp-2 mb-2">
                    {post.description}
                  </p>

                  {/* Stats and time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <HeartIcon className="w-3 h-3" />
                        <span>{post.likeCount}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ChatIcon className="w-3 h-3" />
                        <span>{post.commentCount}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(post.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Edit Post Modal */}
      {editingPost && (
        <EditPostModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          post={editingPost}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}
