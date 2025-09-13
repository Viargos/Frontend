"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Post } from "@/types/post.types";
import { postService } from "@/lib/services/service-factory";
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

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let response;
        if (userId) {
          response = await postService.getPostsByUser(userId);
        } else {
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

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      setDeletingPostId(postId);
      console.log("Attempting to delete post:", postId);

      const response = await postService.deletePost(postId);
      console.log("Delete response:", response);

      // Remove post from local state
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));

      // Call parent callback if provided
      onDeletePost?.(postId);

      console.log("Post deleted successfully");
    } catch (err: any) {
      console.error("Error deleting post:", err);
      console.error("Error details:", {
        message: err.message,
        status: err.status,
        response: err.response,
      });
      alert(`Failed to delete post: ${err.message || "Unknown error"}`);
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
        <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
        <p className="text-gray-500">Start sharing your travel experiences!</p>
      </div>
    );
  }

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
                        <svg
                          className="w-8 h-8 mx-auto mb-2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-xs text-gray-500">Text Post</p>
                      </div>
                    </div>
                  )}

                  {/* Overlay with actions - appears on hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditPost(post.id)}
                        className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 border-none"
                      >
                        <EditIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                        disabled={deletingPostId === post.id}
                        className="bg-red-500 bg-opacity-90 hover:bg-opacity-100 text-white border-none hover:bg-red-600"
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
