"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

import { Post } from "@/types/post.types";
import { usePostLike } from "@/hooks/usePostLike";
import MediaCarousel from "./MediaCarousel";
import CommentSection from "@/components/comment/CommentSection";
import {
  HeartIcon,
  ChatIcon,
  MapPinIcon,
  ClockIcon,
  JourneyIcon,
} from "@/components/icons";

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
  const router = useRouter();
  const [isCommentSectionOpen, setIsCommentSectionOpen] = useState(false);
  const [localCommentCount, setLocalCommentCount] = useState(post.commentCount);

  const { isLiking, localLikeCount, isLiked, handleLike } = usePostLike({
    postId: post.id,
    initialLikeCount: post.likeCount,
    initialIsLiked: post.isLikedByCurrentUser ?? false,
    onLikeChange,
  });

  const handleCommentClick = useCallback(() => {
    setIsCommentSectionOpen((prev) => !prev);
    onCommentClick?.(post.id);
  }, [post.id, onCommentClick]);

  const handleCommentCountChange = useCallback(
    (_postId: string, newCount: number) => {
      setLocalCommentCount(newCount);
    },
    []
  );

  const handleJourneyClick = useCallback(() => {
    if (post.journey?.id) {
      onJourneyClick?.(post.journey.id);
    }
  }, [post.journey?.id, onJourneyClick]);

  const handleUserClick = useCallback(() => {
    if (post.user?.id) {
      router.push(`/user/${post.user.id}`);
    }
  }, [post.user?.id, router]);

  const hasMedia = post.media && post.media.length > 0;
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ${className}`}
    >
      {hasMedia ? (
        <MediaPost
          post={post}
          timeAgo={timeAgo}
          isLiked={isLiked}
          isLiking={isLiking}
          localLikeCount={localLikeCount}
          localCommentCount={localCommentCount}
          isCommentSectionOpen={isCommentSectionOpen}
          onUserClick={handleUserClick}
          onJourneyClick={handleJourneyClick}
          onLike={handleLike}
          onCommentClick={handleCommentClick}
        />
      ) : (
        <TextPost
          post={post}
          timeAgo={timeAgo}
          isLiked={isLiked}
          isLiking={isLiking}
          localLikeCount={localLikeCount}
          localCommentCount={localCommentCount}
          isCommentSectionOpen={isCommentSectionOpen}
          onUserClick={handleUserClick}
          onJourneyClick={handleJourneyClick}
          onLike={handleLike}
          onCommentClick={handleCommentClick}
        />
      )}

      <CommentSection
        post={post}
        isOpen={isCommentSectionOpen}
        onCommentCountChange={handleCommentCountChange}
      />
    </motion.article>
  );
}

// ─── Shared sub-component props ───────────────────────────────────────────────

interface SubPostProps {
  post: Post;
  timeAgo: string;
  isLiked: boolean;
  isLiking: boolean;
  localLikeCount: number;
  localCommentCount: number;
  isCommentSectionOpen: boolean;
  onUserClick: () => void;
  onJourneyClick: () => void;
  onLike: () => void;
  onCommentClick: () => void;
}

// ─── Avatar helper ────────────────────────────────────────────────────────────

function UserAvatar({
  profileImage,
  username,
  size,
  ring,
}: {
  profileImage?: string | null;
  username: string;
  size: "sm" | "md";
  ring?: "white" | "indigo";
}) {
  const dim = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const text = size === "sm" ? "text-xs" : "text-sm";
  const ringClass =
    ring === "white"
      ? "ring-2 ring-white/80"
      : ring === "indigo"
        ? "ring-2 ring-indigo-100"
        : "";

  if (profileImage) {
    return (
      <Image
        src={profileImage}
        alt={username}
        width={size === "sm" ? 32 : 40}
        height={size === "sm" ? 32 : 40}
        className={`${dim} rounded-full object-cover flex-shrink-0 ${ringClass}`}
      />
    );
  }

  return (
    <div
      className={`${dim} rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-[#160E53] to-indigo-400 ${ringClass}`}
    >
      <span className={`text-white font-bold ${text}`}>
        {username.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

// ─── Journey pill ─────────────────────────────────────────────────────────────

function JourneyPill({
  label,
  onClick,
  variant,
}: {
  label: string;
  onClick: () => void;
  variant: "overlay" | "solid";
}) {
  if (variant === "overlay") {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-2 bg-[#160E53]/80 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#160E53] active:scale-95 transition-all duration-200 shadow-md"
      >
        <JourneyIcon className="w-4 h-4" size={16} />
        <span>See full journey</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 bg-[#160E53] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-indigo-900 active:scale-95 transition-all duration-200"
    >
      <JourneyIcon className="w-4 h-4" size={16} />
      <span>See full journey</span>
    </button>
  );
}

// ─── Action bar ───────────────────────────────────────────────────────────────

function ActionBar({
  isLiked,
  isLiking,
  localLikeCount,
  localCommentCount,
  isCommentSectionOpen,
  onLike,
  onCommentClick,
}: {
  isLiked: boolean;
  isLiking: boolean;
  localLikeCount: number;
  localCommentCount: number;
  isCommentSectionOpen: boolean;
  onLike: () => void;
  onCommentClick: () => void;
}) {
  return (
    <div className="flex items-center gap-1 px-3 py-2 border-t border-gray-50">
      <motion.button
        onClick={onLike}
        disabled={isLiking}
        whileTap={{ scale: 0.88 }}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
          isLiked
            ? "text-rose-600 bg-rose-50 hover:bg-rose-100"
            : "text-gray-500 hover:text-rose-500 hover:bg-rose-50"
        }`}
      >
        <motion.span
          animate={isLiked ? { scale: [1, 1.4, 1] } : { scale: 1 }}
          transition={{ duration: 0.25 }}
        >
          <HeartIcon
            className={`w-4 h-4 transition-all duration-200 ${isLiked ? "fill-current" : ""}`}
          />
        </motion.span>
        <span>{localLikeCount}</span>
      </motion.button>

      <button
        onClick={onCommentClick}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
          isCommentSectionOpen
            ? "text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
            : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
        }`}
      >
        <ChatIcon className="w-4 h-4" />
        <span>{localCommentCount}</span>
      </button>
    </div>
  );
}

// ─── Media post layout ────────────────────────────────────────────────────────

function MediaPost({
  post,
  timeAgo,
  isLiked,
  isLiking,
  localLikeCount,
  localCommentCount,
  isCommentSectionOpen,
  onUserClick,
  onJourneyClick,
  onLike,
  onCommentClick,
}: SubPostProps) {
  return (
    <>
      {/* Image with overlays */}
      <div className="relative">
        <MediaCarousel media={post.media} />

        {/* Bottom gradient for user info readability */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/65 to-transparent pointer-events-none z-10" />

        {/* Journey pill — top right */}
        {post.journey && (
          <div className="absolute top-3 right-3 z-20">
            <JourneyPill
              label={post.journey.title}
              onClick={onJourneyClick}
              variant="overlay"
            />
          </div>
        )}

        {/* Location badge — top left (only when no journey) */}
        {post.location && !post.journey && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full shadow">
            <MapPinIcon className="w-3 h-3 text-rose-300" />
            <span className="truncate max-w-[130px]">{post.location}</span>
          </div>
        )}

        {/* User info — bottom left floating over gradient */}
        <button
          onClick={onUserClick}
          className="absolute bottom-3 left-3 z-20 flex items-center gap-2 group/avatar"
        >
          <UserAvatar
            profileImage={post.user.profileImage}
            username={post.user.username}
            size="sm"
            ring="white"
          />
          <span className="text-white text-sm font-semibold drop-shadow-md group-hover/avatar:underline underline-offset-2 transition-all">
            {post.user.username}
          </span>
        </button>
      </div>

      {/* Content below image */}
      <div className="px-4 pt-3 pb-1">
        {/* Meta row: journey label + timestamp */}
        <div className="flex items-center justify-between mb-2">
          {post.journey ? (
            <button
              onClick={onJourneyClick}
              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 hover:underline underline-offset-2 transition-colors"
            >
              <MapPinIcon className="w-3 h-3 flex-shrink-0" />
              <span className="text-xs font-semibold truncate max-w-[180px]">
                {post.journey.title}
              </span>
            </button>
          ) : post.location ? (
            <span className="flex items-center gap-1 text-gray-400 text-xs">
              <MapPinIcon className="w-3 h-3 flex-shrink-0" />
              <span className="truncate max-w-[180px]">{post.location}</span>
            </span>
          ) : (
            <span />
          )}

          <span className="flex items-center gap-1 text-gray-400 text-xs flex-shrink-0 ml-2">
            <ClockIcon className="w-3 h-3" />
            {timeAgo}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-800 text-sm leading-relaxed">{post.description}</p>
      </div>

      <ActionBar
        isLiked={isLiked}
        isLiking={isLiking}
        localLikeCount={localLikeCount}
        localCommentCount={localCommentCount}
        isCommentSectionOpen={isCommentSectionOpen}
        onLike={onLike}
        onCommentClick={onCommentClick}
      />
    </>
  );
}

// ─── Text-only post layout ────────────────────────────────────────────────────

function TextPost({
  post,
  timeAgo,
  isLiked,
  isLiking,
  localLikeCount,
  localCommentCount,
  isCommentSectionOpen,
  onUserClick,
  onJourneyClick,
  onLike,
  onCommentClick,
}: SubPostProps) {
  return (
    <>
      {/* Left accent bar + content */}
      <div className="flex">
        {/* Accent strip */}
        <div className="w-1 flex-shrink-0 bg-gradient-to-b from-[#160E53] to-indigo-300 rounded-l-2xl" />

        <div className="flex-1 px-4 pt-4 pb-2 min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <button
              onClick={onUserClick}
              className="flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity"
            >
              <UserAvatar
                profileImage={post.user.profileImage}
                username={post.user.username}
                size="md"
                ring="indigo"
              />
              <div className="text-left min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {post.user.username}
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <ClockIcon className="w-3 h-3 flex-shrink-0" />
                  {timeAgo}
                </p>
              </div>
            </button>

            {post.journey && (
              <div className="flex-shrink-0">
                <JourneyPill
                  label={post.journey.title}
                  onClick={onJourneyClick}
                  variant="solid"
                />
              </div>
            )}
          </div>

          {/* Location / journey label */}
          {(post.location || post.journey) && (
            <div className="flex items-center gap-1.5 mb-2.5">
              <MapPinIcon className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
              {post.journey ? (
                <button
                  onClick={onJourneyClick}
                  className="text-xs font-semibold text-indigo-600 hover:underline underline-offset-2 truncate"
                >
                  {post.journey.title}
                </button>
              ) : (
                <span className="text-xs text-gray-500 truncate">
                  {post.location}
                </span>
              )}
            </div>
          )}

          {/* Description */}
          <p className="text-gray-800 text-sm leading-relaxed">
            {post.description}
          </p>
        </div>
      </div>

      <ActionBar
        isLiked={isLiked}
        isLiking={isLiking}
        localLikeCount={localLikeCount}
        localCommentCount={localCommentCount}
        isCommentSectionOpen={isCommentSectionOpen}
        onLike={onLike}
        onCommentClick={onCommentClick}
      />
    </>
  );
}
