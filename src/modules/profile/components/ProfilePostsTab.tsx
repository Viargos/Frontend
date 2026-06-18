'use client';

import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react';
import type { ProfilePost } from '@/modules/profile/types/profile.types';
import * as motion from 'framer-motion/client';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { ChatBubbleIcon, EditIcon, HeartIcon, ImageIcon, JourneyIcon } from '@/modules/common/icons';
import { PostDetailModal } from '@/modules/profile/components/PostDetailModal';
import { PostEditModal } from '@/modules/profile/components/PostEditModal';
import { ProfilePostMediaCarousel } from '@/modules/profile/components/ProfilePostMediaCarousel';

type ProfilePostsTabProps = {
  isOwnProfile?: boolean;
  isLoading?: boolean;
  ownerName: string;
  posts: ProfilePost[];
};

export const ProfilePostsTab = (props: ProfilePostsTabProps) => {
  const { isLoading = false, isOwnProfile = true, ownerName, posts } = props;
  const contentPaddingClass = isOwnProfile ? 'pb-12' : 'px-4 pb-12 sm:px-6';
  const [editingPost, setEditingPost] = useState<ProfilePost | null>(null);
  const [selectedPost, setSelectedPost] = useState<ProfilePost | null>(null);
  const [deletedPostIds, setDeletedPostIds] = useState<Set<string>>(() => new Set());
  const [editedDescriptions, setEditedDescriptions] = useState<Record<string, string>>({});
  const lastTapRef = useRef<{ postId: string; time: number } | null>(null);

  const visiblePosts = useMemo(() => posts
    .filter(post => !deletedPostIds.has(post.id))
    .map(post => ({
      ...post,
      description: editedDescriptions[post.id] ?? post.description,
    })), [deletedPostIds, editedDescriptions, posts]);

  const handleSaved = (postId: string, updatedDescription: string) => {
    setEditedDescriptions(previous => ({
      ...previous,
      [postId]: updatedDescription,
    }));
    setEditingPost(null);
  };

  const handleDeleted = (postId: string) => {
    setDeletedPostIds((previous) => {
      const next = new Set(previous);
      next.add(postId);
      return next;
    });
    setEditingPost(null);
  };

  const isInteractiveTarget = (target: EventTarget | null): boolean => (
    target instanceof Element
    && Boolean(target.closest('a, button, input, select, textarea, [data-ignore-post-open]'))
  );

  const handlePostDoubleClick = (event: MouseEvent<HTMLElement>, post: ProfilePost) => {
    if (isInteractiveTarget(event.target)) {
      return;
    }

    setSelectedPost(post);
  };

  const handlePostPointerUp = (event: PointerEvent<HTMLElement>, post: ProfilePost) => {
    if (event.pointerType === 'mouse' || isInteractiveTarget(event.target)) {
      return;
    }

    const now = event.timeStamp;
    const lastTap = lastTapRef.current;

    if (lastTap && lastTap.postId === post.id && now - lastTap.time < 350) {
      lastTapRef.current = null;
      setSelectedPost(post);
      return;
    }

    lastTapRef.current = { postId: post.id, time: now };
  };

  const handlePostKeyDown = (event: KeyboardEvent<HTMLElement>, post: ProfilePost) => {
    if (isInteractiveTarget(event.target) || (event.key !== 'Enter' && event.key !== ' ')) {
      return;
    }

    event.preventDefault();
    setSelectedPost(post);
  };

  return (
    <>
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
            : visiblePosts.length > 0
              ? (
                  <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                    {visiblePosts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        aria-label="Open post details"
                        animate={{ opacity: 1, scale: 1 }}
                        className="group relative cursor-zoom-in touch-manipulation overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:outline-none"
                        initial={{ opacity: 0, scale: 0.9 }}
                        tabIndex={0}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        onDoubleClick={event => handlePostDoubleClick(event, post)}
                        onKeyDown={event => handlePostKeyDown(event, post)}
                        onPointerUp={event => handlePostPointerUp(event, post)}
                      >
                        <div className="relative aspect-square bg-gray-100">
                          {post.mediaUrls && post.mediaUrls.length > 0
                            ? (
                                <ProfilePostMediaCarousel mediaUrls={post.mediaUrls} />
                              )
                            : (
                                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
                                  <div className="text-center">
                                    <ImageIcon className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                    <p className="text-xs text-gray-500">Text Post</p>
                                  </div>
                                </div>
                              )}

                          {isOwnProfile
                            ? (
                                <div className="absolute top-2 right-2 z-10 flex items-center justify-end gap-1.5 sm:top-3 sm:right-3 sm:gap-2">
                                  <button
                                    aria-label="Edit post"
                                    className="profile-post-action-button flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all hover:scale-105 hover:shadow-lg active:scale-95 sm:h-10 sm:w-10"
                                    data-ignore-post-open
                                    type="button"
                                    onClick={() => setEditingPost(post)}
                                  >
                                    <EditIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                  </button>
                                </div>
                              )
                            : null}
                        </div>

                        {post.journey
                          ? (
                              <div className="profile-post-journey-strip border-b px-3 py-2">
                                <Link
                                  className="profile-post-journey-link flex items-center gap-2 text-xs transition-colors"
                                  data-ignore-post-open
                                  href={`/journey/${post.journey.id}`}
                                >
                                  <JourneyIcon className="profile-post-journey-icon h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                                  <span className="truncate font-medium" title={post.journey.title}>
                                    {post.journey.title}
                                  </span>
                                </Link>
                              </div>
                            )
                          : null}

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

      {editingPost
        ? (
            <PostEditModal
              postId={editingPost.id}
              onClose={() => setEditingPost(null)}
              onDeleted={() => handleDeleted(editingPost.id)}
              onSaved={description => handleSaved(editingPost.id, description)}
            />
          )
        : null}

      {selectedPost
        ? (
            <PostDetailModal
              key={selectedPost.id}
              post={selectedPost}
              onClose={() => setSelectedPost(null)}
            />
          )
        : null}
    </>
  );
};
