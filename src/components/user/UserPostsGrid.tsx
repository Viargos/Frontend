'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RecentPost } from '@/types/user.types';
import { formatDistanceToNow } from 'date-fns';
import HeartIcon from '@/components/icons/HeartIcon';
import ChatIcon from '@/components/icons/ChatIcon';
import { PostsEmptyIcon, ImageIcon } from '@/components/icons';
import Image from 'next/image';

interface UserPostsGridProps {
  posts: RecentPost[];
  className?: string;
  username: string;
}

export default function UserPostsGrid({
  posts,
  className = '',
  username,
}: UserPostsGridProps) {
  // Debug logging
  console.log('UserPostsGrid received posts:', posts);
  console.log('Posts length:', posts.length);

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
    <div className={`w-full pb-8 ${className}`}>
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
                {post.mediaUrls && post.mediaUrls.length > 0 ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={post.mediaUrls[0]}
                      alt={post.description || 'Post image'}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      className="object-cover"
                      quality={85}
                      onError={e => {
                        console.error(
                          'Image failed to load:',
                          post.mediaUrls[0],
                          e
                        );
                      }}
                    />

                    {/* Multiple images indicator */}
                    {post.mediaUrls.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                        +{post.mediaUrls.length - 1}
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

                {/* Hover overlay for interaction */}
                <div className="absolute inset-0 group-hover:bg-opacity-30 transition-all duration-300" />
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
  );
}
