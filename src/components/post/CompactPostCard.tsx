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
import Image from "next/image";

interface CompactPostCardProps {
    post: Post;
    onLikeChange?: (postId: string, isLiked: boolean, newCount: number) => void;
    onCommentClick?: (postId: string) => void;
    onJourneyClick?: (journeyId: string) => void;
    className?: string;
}

export default function CompactPostCard({
    post,
    onLikeChange,
    onCommentClick,
    onJourneyClick,
    className = "",
}: CompactPostCardProps) {
    const [isLiking, setIsLiking] = useState(false);
    const [localLikeCount, setLocalLikeCount] = useState(post.likeCount);
    const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser || false);

    const handleLike = useCallback(async () => {
        if (isLiking) return;

        try {
            setIsLiking(true);
            const newIsLiked = !isLiked;
            const newCount = newIsLiked
                ? localLikeCount + 1
                : localLikeCount - 1;

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

    // Get the first image for display
    const firstImage = post.media?.find((m) => m.type === "image");
    const hasImage = firstImage && firstImage.url;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 ${className}`}
        >
            {/* Mobile/Tablet Layout (vertical stack) */}
            <div className="block md:hidden">
                {/* Header */}
                <div className="p-4 pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                            {post.user.profileImage ? (
                                <Image
                                    src={post.user.profileImage}
                                    alt={post.user.username}
                                    width={40}
                                    height={40}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                    <span className="text-gray-600 font-medium text-sm">
                                        {post.user.username
                                            .charAt(0)
                                            .toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div>
                                <h4 className="font-medium text-gray-900 text-sm">
                                    {post.user.username}
                                </h4>
                                <p className="text-xs text-gray-500">
                                    {formatDistanceToNow(
                                        new Date(post.createdAt),
                                        {
                                            addSuffix: true,
                                        }
                                    )}
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
                                <span>Journey</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Media */}
                {hasImage && (
                    <div className="relative h-56 bg-gray-100">
                        <Image
                            src={firstImage.url}
                            alt={post.description || "Post image"}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 400px"
                        />
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
                                    className={`w-4 h-4 ${
                                        isLiked ? "fill-current" : ""
                                    }`}
                                />
                                <span className="text-sm font-medium">
                                    {localLikeCount}
                                </span>
                            </button>

                            <button
                                onClick={handleCommentClick}
                                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                            >
                                <ChatIcon className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                    {post.commentCount}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

      {/* Desktop/Laptop Layout (horizontal) */}
      <div className="hidden md:flex">
        {/* Left Side - Image (50% width) */}
        <div className="w-1/2 flex-shrink-0">
          {hasImage ? (
            <div className="relative aspect-[4/3] bg-gray-100">
              <Image
                src={firstImage.url}
                alt={post.description || "Post image"}
                fill
                className="object-cover"
                sizes="50vw"
              />
            </div>
          ) : (
            <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">No image</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Content (50% width) */}
        <div className="w-1/2 flex flex-col">
          {/* Header */}
          <div className="p-4 pb-3 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                {post.user.profileImage ? (
                  <Image
                    src={post.user.profileImage}
                    alt={post.user.username}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium text-sm">
                      {post.user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">
                    {post.user.username}
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
                  <span>See journey</span>
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
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
            <p className="text-gray-900 text-sm leading-relaxed mb-4 line-clamp-3">
              {post.description}
            </p>
          </div>

          {/* Actions */}
          <div className="p-4 pt-0 mt-auto">
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
        </div>
      </div>
        </motion.div>
    );
}
