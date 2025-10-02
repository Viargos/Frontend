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
import MediaCarousel from "./MediaCarousel";
import Image from "next/image";

interface GuestPostCardProps {
    post: Post;
    onLikeChange?: (postId: string, isLiked: boolean, newCount: number) => void;
    onCommentClick?: (postId: string) => void;
    onJourneyClick?: (journeyId: string) => void;
    className?: string;
}

export default function GuestPostCard({
    post,
    onLikeChange,
    onCommentClick,
    onJourneyClick,
    className = "",
}: GuestPostCardProps) {
    const [localLikeCount, setLocalLikeCount] = useState(post.likeCount);
    const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser || false);

    const handleLike = useCallback(() => {
        const newIsLiked = !isLiked;
        const newCount = newIsLiked ? localLikeCount + 1 : localLikeCount - 1;

        // Update local state only (no API call)
        setIsLiked(newIsLiked);
        setLocalLikeCount(newCount);

        // Notify parent component (which will show auth prompt for guests)
        onLikeChange?.(post.id, newIsLiked, newCount);
    }, [isLiked, localLikeCount, post.id, onLikeChange]);

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
                                        ?.charAt(0)
                                        .toUpperCase() || "U"}
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
                            icon={<JourneyIcon className="text-white" />}
                            iconPosition="leading"
                            onClick={handleJourneyClick}
                            className="cursor-pointer"
                        >
                            Journey
                        </Button>
                    )}
                </div>
            </div>

            {/* Media */}
            {post.media && post.media.length > 0 && (
                <MediaCarousel media={post.media} />
            )}

            {/* Content */}
            <div className="p-4">
                {/* Location */}
                {(post.location || post.journey) && (
                    <div className="flex items-center space-x-2 mb-3 text-sm text-gray-600">
                        <MapIcon className="w-4 h-4" />
                        <span>
                            {post.journey ? (
                                <span
                                    className="font-medium text-blue-600 cursor-pointer"
                                    onClick={handleJourneyClick}
                                >
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
                            disabled={false}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
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
                            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
                        >
                            <ChatIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                {post.commentCount}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
