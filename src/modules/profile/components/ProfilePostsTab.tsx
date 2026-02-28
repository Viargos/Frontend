'use client';

import type { ProfilePost } from '@/modules/profile/types/profile.types';
import * as motion from 'framer-motion/client';
import Image from 'next/image';
import { ChatBubbleIcon, HeartIcon, ImageIcon } from '@/modules/common/icons';

type ProfilePostsTabProps = {
  isOwnProfile?: boolean;
  isLoading?: boolean;
  ownerName: string;
  posts: ProfilePost[];
};

export const ProfilePostsTab = (props: ProfilePostsTabProps) => {
  const { isLoading = false, isOwnProfile = true, ownerName, posts } = props;
  const contentPaddingClass = isOwnProfile ? 'pb-12' : 'px-4 pb-12 sm:px-6';

  return (
    <div className={`flex w-full flex-col items-start gap-4 ${contentPaddingClass}`}>
      <h2 className="font-outfit text-2xl leading-[120%] font-medium text-black">
        {ownerName}
        {'\''}
        s Posts
      </h2>
      <div className="w-full">
        {isLoading
          ? (
              <div className="flex w-full items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
              </div>
            )
          : posts.length > 0
            ? (
                <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                  {posts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="relative aspect-square bg-gray-100">
                        {post.mediaUrls && post.mediaUrls.length > 0
                          ? (
                              <Image
                                alt="Post media"
                                className="object-cover"
                                fill
                                sizes="(max-width: 640px) 100vw, 25vw"
                                src={post.mediaUrls[0]!}
                              />
                            )
                          : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                <div className="text-center">
                                  <ImageIcon className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                  <p className="text-xs text-gray-500">Text Post</p>
                                </div>
                              </div>
                            )}
                      </div>

                      <div className="p-3">
                        <p className="mb-2 line-clamp-2 text-sm text-gray-900">{post.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <HeartIcon className="h-3 w-3" />
                              <span>{post.likeCount}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ChatBubbleIcon className="h-3 w-3" />
                              <span>{post.commentCount}</span>
                            </div>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(post.createdAt).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )
            : (
                <div className="py-12 text-center">
                  <ImageIcon className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                  <h3 className="mb-2 text-lg font-medium text-gray-900">No posts yet</h3>
                  <p className="text-gray-500">Start sharing your travel experiences!</p>
                </div>
              )}
      </div>
    </div>
  );
};
