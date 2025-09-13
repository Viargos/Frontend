"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Post } from "@/types/post.types";
import { formatDistanceToNow } from "date-fns";
import HeartIcon from "@/components/icons/HeartIcon";
import ChatIcon from "@/components/icons/ChatIcon";
import MapIcon from "@/components/icons/MapIcon";
import JourneyIcon from "@/components/icons/JourneyIcon";
import Button from "@/components/ui/Button";
import { postService } from "@/lib/services/service-factory";

interface PostCardProps {
  post: Post;
  onLikeChange?: (postId: string, isLiked: boolean, newCount: number) => void;
  onCommentClick?: (postId: string) => void;
  onJourneyClick?: (journeyId: string) => void;
  className?: string;
}

export default function PostCard({
  post,
  onLikeChange,
  onCommentClick,
  onJourneyClick,
  className = "",
}: PostCardProps) {
  const [isLiking, setIsLiking] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(post.likeCount);
  const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser || false);

  const handleLike = useCallback(async () => {
    if (isLiking) return;

    try {
      setIsLiking(true);
      const newIsLiked = !isLiked;
      const newCount = newIsLiked ? localLikeCount + 1 : localLikeCount - 1;

      // Optimistic update
      setIsLiked(newIsLiked);
      setLocalLikeCount(newCount);

      // API call
      if (newIsLiked) {
        await postService.likePost(post.id);
      } else {
        await postService.unlikePost(post.id);
      }

      onLikeChange?.(post.id, newIsLiked, newCount);
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(!isLiked);
      setLocalLikeCount(localLikeCount);
      console.error("Failed to toggle like:", error);
    } finally {
      setIsLiking(false);
    }
  }, [isLiking, isLiked, localLikeCount, post.id, onLikeChange]);

  const handleCommentClick = useCallback(() => {
    onCommentClick?.(post.id);
  }, [post.id, onCommentClick]);

  const handleJourneyClick = useCallback(() => {
    if (post.journey?.id) {
      onJourneyClick?.(post.journey.id);
    }
  }, [post.journey?.id, onJourneyClick]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {post.user.profileImage ? (
              <img
                src={post.user.profileImage}
                alt={post.user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium text-sm">
                  {post.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h4 className="font-medium text-gray-900 text-sm">
                {post.user.name}
              </h4>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>

          {/* Journey Link Button */}
          {post.journey && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleJourneyClick}
              className="flex items-center space-x-1 text-xs bg-blue-600 hover:bg-blue-700 text-white border-none"
            >
              <JourneyIcon className="w-3 h-3" />
              <span>See full journey</span>
            </Button>
          )}
        </div>
      </div>

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div className="relative">
          {post.media.length === 1 ? (
            <div className="aspect-square">
              {post.media[0].type === "image" ? (
                <img
                  src={post.media[0].url}
                  alt="Post media"
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={post.media[0].url}
                  poster={post.media[0].thumbnailUrl}
                  controls
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1 aspect-square">
              {post.media.slice(0, 4).map((media, index) => (
                <div
                  key={media.id}
                  className={`relative ${
                    post.media.length === 3 && index === 0 ? "row-span-2" : ""
                  }`}
                >
                  {media.type === "image" ? (
                    <img
                      src={media.url}
                      alt={`Post media ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={media.url}
                      poster={media.thumbnailUrl}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {index === 3 && post.media.length > 4 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-medium">
                        +{post.media.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Location */}
        {(post.location || post.journey) && (
          <div className="flex items-center space-x-2 mb-3 text-sm text-gray-600">
            <MapIcon className="w-4 h-4" />
            <span>
              {post.journey ? (
                <span className="font-medium text-blue-600">
                  {post.journey.title}
                </span>
              ) : (
                post.location
              )}
            </span>
          </div>
        )}

        {/* Description */}
        <p className="text-gray-900 text-sm leading-relaxed mb-4">
          {post.description}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                isLiked
                  ? "text-red-600 bg-red-50 hover:bg-red-100"
                  : "text-gray-600 hover:text-red-600 hover:bg-red-50"
              }`}
            >
              <HeartIcon
                className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
              />
              <span className="text-sm font-medium">{localLikeCount}</span>
            </button>

            <button
              onClick={handleCommentClick}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
            >
              <ChatIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{post.commentCount}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
