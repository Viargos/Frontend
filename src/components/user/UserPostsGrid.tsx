'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Post } from '@/types/post.types';
import { formatDistanceToNow } from 'date-fns';
import HeartIcon from '@/components/icons/HeartIcon';
import ChatIcon from '@/components/icons/ChatIcon';
import { PostsEmptyIcon, ImageIcon } from '@/components/icons';
import Image from 'next/image';
import { usePostLike } from '@/hooks/usePostLike';
import PostDetailModal from '@/components/post/PostDetailModal';

interface UserPostsGridProps {
  posts: Post[];
  className?: string;
  username: string;
}

/**
 * PostGridItem - Individual post card in grid with interactions
 */
interface PostGridItemProps {
  post: Post;
  index: number;
  onPostClick: (post: Post) => void;
}

function PostGridItem({ post, index, onPostClick }: PostGridItemProps) {
  const { isLiking, localLikeCount, isLiked, handleLike } = usePostLike({
    postId: post.id,
    initialLikeCount: post.likeCount,
    initialIsLiked: post.isLikedByCurrentUser || false,
  });

  const handleLikeClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent opening post detail
      handleLike();
    },
    [handleLike]
  );

  const handleCommentClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent duplicate modal open
      onPostClick(post);
    },
    [onPostClick, post]
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={() => onPostClick(post)}
      className="group relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      {/* Post Image/Media */}
      <div className="relative aspect-square bg-gray-100">
        {post.media && post.media.length > 0 ? (
          <div className="relative w-full h-full">
            <Image
              src={post.media[0].url}
              alt={post.description || 'Post image'}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="object-cover"
              quality={85}
              onError={(e) => {
                console.error('Image failed to load:', post.media[0].url, e);
              }}
            />

            {/* Multiple images indicator */}
            {post.media.length > 1 && (
              <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full z-10">
                +{post.media.length - 1}
              </div>
            )}
          </div>
        ) : (
          // Placeholder for posts without media
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-xs text-gray-500">Text Post</p>
            </div>
          </div>
        )}

        {/* Desktop Hover Overlay with interactions */}
        <div className="hidden sm:flex absolute inset-0 bg-black/0 group-hover:bg-black/40 backdrop-blur-0 group-hover:backdrop-blur-sm transition-all duration-300 items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-3">
            {/* Like Button */}
            <button
              onClick={handleLikeClick}
              disabled={isLiking}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                isLiked
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-white/90 hover:bg-white text-gray-700'
              }`}
            >
              <HeartIcon
                className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`}
              />
              <span className="text-sm font-medium">{localLikeCount}</span>
            </button>

            {/* Comment Button */}
            <button
              onClick={handleCommentClick}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/90 hover:bg-white text-gray-700 transition-all duration-200"
            >
              <ChatIcon className="w-5 h-5" />
              <span className="text-sm font-medium">{post.commentCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Post Info */}
      <div className="p-3">
        {/* Description */}
        <p className="text-sm text-gray-900 line-clamp-2 mb-2">
          {post.description}
        </p>

        {/* Stats and time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <HeartIcon className={`w-3 h-3 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{localLikeCount}</span>
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
  );
}

export default function UserPostsGrid({
  posts,
  className = '',
  username,
}: UserPostsGridProps) {
  const router = useRouter();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debug logging
  console.log('UserPostsGrid received posts:', posts);
  console.log('Posts length:', posts.length);

  const handlePostClick = useCallback((post: Post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    // Small delay before clearing to allow exit animation
    setTimeout(() => setSelectedPost(null), 300);
  }, []);

  const handleJourneyClick = useCallback(
    (journeyId: string) => {
      handleCloseModal();
      router.push(`/journey/${journeyId}`);
    },
    [router, handleCloseModal]
  );

  if (posts.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <PostsEmptyIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
        <p className="text-gray-500">{username} hasn&apos;t shared any posts yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className={`w-full pb-8 ${className}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          <AnimatePresence>
            {posts.map((post, index) => (
              <PostGridItem
                key={post.id}
                post={post}
                index={index}
                onPostClick={handlePostClick}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Post Detail Modal */}
      <PostDetailModal
        post={selectedPost}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onJourneyClick={handleJourneyClick}
      />
    </>
  );
}
