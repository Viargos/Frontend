'use client';

import type { FormEvent } from 'react';
import type { DashboardPost, DashboardPostComment } from '@/modules/dashboard/types/dashboard.types';
import * as motion from 'framer-motion/client';
import Image from 'next/image';
import { memo, useCallback, useState } from 'react';
import { formatPostTimestamp } from '@/modules/dashboard/helpers/date.helper';
import { usePostActions } from '@/modules/dashboard/hooks/use-post-actions';
import { ChatIcon, ClockIcon, HeartIcon, JourneyIcon, MapPinIcon } from './dashboard-icons';
import { DashboardMediaCarousel } from './DashboardMediaCarousel';

type DashboardPostCardProps = {
  post: DashboardPost;
};

type PostLayoutProps = {
  isCommentSectionOpen: boolean;
  isLikePending: boolean;
  isLiked: boolean;
  commentCount: number;
  likeCount: number;
  onCommentClick: () => void;
  onLikeClick: () => void;
  post: DashboardPost;
  timeAgo: string;
};

type CommentComposerProps = {
  comments: DashboardPostComment[];
  error: string | null;
  isOpen: boolean;
  isPending: boolean;
  onSubmit: (content: string) => void;
};

function UserAvatar(props: { profileImage?: string; ring?: 'white' | 'indigo'; size: 'sm' | 'md'; username: string }) {
  const { profileImage, ring, size, username } = props;
  const dimensionClassName = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const textClassName = size === 'sm' ? 'text-xs' : 'text-sm';
  const ringClassName = ring === 'white' ? 'ring-2 ring-white/80' : ring === 'indigo' ? 'ring-2 ring-indigo-100' : '';

  if (profileImage) {
    return <Image alt={username} className={`${dimensionClassName} flex-shrink-0 rounded-full object-cover ${ringClassName}`} height={size === 'sm' ? 32 : 40} src={profileImage} unoptimized width={size === 'sm' ? 32 : 40} />;
  }

  return (
    <div className={`${dimensionClassName} flex flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#160E53] to-indigo-400 ${ringClassName}`}>
      <span className={`font-bold text-white ${textClassName}`}>
        {username.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

function JourneyPill(props: { onClick: () => void; variant: 'overlay' | 'solid' }) {
  const { onClick, variant } = props;

  if (variant === 'overlay') {
    return (
      <button className="flex items-center gap-2 rounded-xl bg-[#160E53]/80 px-4 py-2 text-sm font-semibold text-white shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-[#160E53] active:scale-95" type="button" onClick={onClick}>
        <JourneyIcon className="h-4 w-4" />
        <span>See full journey</span>
      </button>
    );
  }

  return (
    <button className="flex items-center gap-2 rounded-xl bg-[#160E53] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-indigo-900 active:scale-95" type="button" onClick={onClick}>
      <JourneyIcon className="h-4 w-4" />
      <span>See full journey</span>
    </button>
  );
}

function ActionBar(props: Pick<PostLayoutProps, 'isCommentSectionOpen' | 'isLikePending' | 'isLiked' | 'commentCount' | 'likeCount' | 'onCommentClick' | 'onLikeClick'>) {
  const { isCommentSectionOpen, isLikePending, isLiked, commentCount, likeCount, onCommentClick, onLikeClick } = props;

  return (
    <div className="flex items-center gap-1 border-t border-gray-50 px-3 py-2">
      <motion.button
        className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-200 ${
          isLiked ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'text-gray-500 hover:bg-rose-50 hover:text-rose-500'
        }`}
        transition={{ duration: 0.2 }}
        type="button"
        whileTap={{ scale: 0.88 }}
        disabled={isLikePending}
        onClick={onLikeClick}
      >
        <motion.span animate={isLiked ? { scale: [1, 1.4, 1] } : { scale: 1 }} transition={{ duration: 0.25 }}>
          <HeartIcon className={`h-4 w-4 transition-all duration-200 ${isLiked ? 'fill-current' : ''}`} />
        </motion.span>
        <span>{likeCount}</span>
      </motion.button>

      <button
        className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-200 ${
          isCommentSectionOpen ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
        }`}
        type="button"
        onClick={onCommentClick}
      >
        <ChatIcon className="h-4 w-4" />
        <span>{commentCount}</span>
      </button>
    </div>
  );
}

function MediaPost(props: PostLayoutProps) {
  const { isCommentSectionOpen, isLikePending, isLiked, commentCount, likeCount, onCommentClick, onLikeClick, post, timeAgo } = props;

  return (
    <>
      <div className="relative">
        <DashboardMediaCarousel media={post.media} />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-t from-black/65 to-transparent" />

        {post.journey
          ? (
              <div className="absolute top-3 right-3 z-20">
                <JourneyPill variant="overlay" onClick={() => {}} />
              </div>
            )
          : null}

        {post.location && !post.journey
          ? (
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white shadow backdrop-blur-sm">
                <MapPinIcon className="h-3 w-3 text-rose-300" />
                <span className="max-w-[130px] truncate">{post.location}</span>
              </div>
            )
          : null}

        <button className="group/avatar absolute bottom-3 left-3 z-20 flex items-center gap-2" type="button">
          <UserAvatar profileImage={post.user.profileImage} ring="white" size="sm" username={post.user.username} />
          <span className="text-sm font-semibold text-white underline-offset-2 drop-shadow-md transition-all group-hover/avatar:underline">
            {post.user.username}
          </span>
        </button>
      </div>

      <div className="px-4 pt-3 pb-1">
        <div className="mb-2 flex items-center justify-between">
          {post.journey
            ? (
                <button className="flex items-center gap-1 text-indigo-600 underline-offset-2 transition-colors hover:text-indigo-800 hover:underline" type="button">
                  <MapPinIcon className="h-3 w-3 flex-shrink-0" />
                  <span className="max-w-[180px] truncate text-xs font-semibold">{post.journey.title}</span>
                </button>
              )
            : post.location
              ? (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPinIcon className="h-3 w-3 flex-shrink-0" />
                    <span className="max-w-[180px] truncate">{post.location}</span>
                  </span>
                )
              : <span />}

          <span className="ml-2 flex flex-shrink-0 items-center gap-1 text-xs text-gray-400">
            <ClockIcon className="h-3 w-3" />
            {timeAgo}
          </span>
        </div>

        <p className="text-sm leading-relaxed text-gray-800">{post.description}</p>
      </div>

      <ActionBar
        isCommentSectionOpen={isCommentSectionOpen}
        isLikePending={isLikePending}
        isLiked={isLiked}
        commentCount={commentCount}
        likeCount={likeCount}
        onCommentClick={onCommentClick}
        onLikeClick={onLikeClick}
      />
    </>
  );
}

function TextPost(props: PostLayoutProps) {
  const { isCommentSectionOpen, isLikePending, isLiked, commentCount, likeCount, onCommentClick, onLikeClick, post, timeAgo } = props;

  return (
    <>
      <div className="flex">
        <div className="w-1 flex-shrink-0 rounded-l-2xl bg-gradient-to-b from-[#160E53] to-indigo-300" />

        <div className="min-w-0 flex-1 px-4 pt-4 pb-2">
          <div className="mb-3 flex items-start justify-between gap-3">
            <button className="flex w-[178px] min-w-0 items-center gap-3 transition-opacity hover:opacity-80" type="button">
              <UserAvatar profileImage={post.user.profileImage} ring="indigo" size="md" username={post.user.username} />
              <div className="min-w-0 text-left">
                <p className="truncate text-sm font-semibold text-gray-900">{post.user.username}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                  <ClockIcon className="h-3 w-3 flex-shrink-0" />
                  {timeAgo}
                </p>
              </div>
            </button>

            {post.journey
              ? (
                  <div className="flex-shrink-0">
                    <JourneyPill variant="solid" onClick={() => {}} />
                  </div>
                )
              : null}
          </div>

          {post.location || post.journey
            ? (
                <div className="mb-2.5 flex items-center gap-1.5">
                  <MapPinIcon className="h-3.5 w-3.5 flex-shrink-0 text-rose-400" />
                  {post.journey
                    ? <button className="truncate text-xs font-semibold text-indigo-600 underline-offset-2 hover:underline" type="button">{post.journey.title}</button>
                    : <span className="truncate text-xs text-gray-500">{post.location}</span>}
                </div>
              )
            : null}

          <p className="text-sm leading-relaxed text-gray-800">{post.description}</p>
        </div>
      </div>

      <ActionBar
        isCommentSectionOpen={isCommentSectionOpen}
        isLikePending={isLikePending}
        isLiked={isLiked}
        commentCount={commentCount}
        likeCount={likeCount}
        onCommentClick={onCommentClick}
        onLikeClick={onLikeClick}
      />
    </>
  );
}

function CommentComposer(props: CommentComposerProps) {
  const { comments, error, isOpen, isPending, onSubmit } = props;
  const [commentText, setCommentText] = useState('');

  const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const content = commentText.trim();
    if (!content || isPending) {
      return;
    }

    onSubmit(content);
    setCommentText('');
  }, [commentText, isPending, onSubmit]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="space-y-2 border-t border-gray-100 px-4 py-3">
      {comments.length > 0
        ? (
            <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-2">
              {comments.map(comment => (
                <div key={comment.id} className="rounded-md bg-white px-2.5 py-2 text-xs text-gray-700 shadow-sm">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="font-medium text-gray-500">You</span>
                    {comment.isPending ? <span className="text-[10px] text-indigo-500">Sending...</span> : null}
                  </div>
                  <p className="text-sm break-words whitespace-pre-wrap text-gray-800">{comment.content}</p>
                </div>
              ))}
            </div>
          )
        : null}
      <form className="flex items-center gap-2" onSubmit={event => void handleSubmit(event)}>
        <input
          className="h-9 flex-1 rounded-lg border border-gray-200 px-3 text-sm text-gray-800 transition-colors outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200"
          disabled={isPending}
          maxLength={500}
          placeholder="Add a comment..."
          type="text"
          value={commentText}
          onChange={event => setCommentText(event.target.value)}
        />
        <button
          className="h-9 rounded-lg bg-[#160E53] px-3 text-sm font-medium text-white transition-colors hover:bg-indigo-900 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending || commentText.trim().length === 0}
          type="submit"
        >
          {isPending ? 'Posting...' : 'Post'}
        </button>
      </form>
      {error
        ? (
            <p className="text-xs text-red-600">
              {error}
            </p>
          )
        : null}
    </div>
  );
}

const DashboardPostCardComponent = (props: DashboardPostCardProps) => {
  const { post } = props;
  const [isCommentSectionOpen, setIsCommentSectionOpen] = useState(false);
  const {
    addComment,
    addCommentError,
    isCommentPendingForPost,
    isLikePendingForPost,
    toggleLike,
    toggleLikeError,
  } = usePostActions();
  const hasMedia = post.media.length > 0;
  const timeAgo = formatPostTimestamp(post.createdAt);
  const isCommentPending = isCommentPendingForPost(post.id);
  const isLikePending = isLikePendingForPost(post.id);

  const handleLikeClick = useCallback(async () => {
    if (isLikePending) {
      return;
    }

    await toggleLike({
      isCurrentlyLiked: post.isLikedByCurrentUser,
      postId: post.id,
    });
  }, [isLikePending, post.id, post.isLikedByCurrentUser, toggleLike]);

  const handleCommentSubmit = useCallback((content: string): void => {
    if (isCommentPending) {
      return;
    }

    void addComment({
      payload: { content },
      postId: post.id,
    });
  }, [addComment, isCommentPending, post.id]);

  const sharedProps: PostLayoutProps = {
    isCommentSectionOpen,
    isLikePending,
    isLiked: post.isLikedByCurrentUser,
    commentCount: post.commentCount,
    likeCount: post.likeCount,
    onCommentClick: () => setIsCommentSectionOpen(previous => !previous),
    onLikeClick: handleLikeClick,
    post,
    timeAgo,
  };

  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {hasMedia ? <MediaPost {...sharedProps} /> : <TextPost {...sharedProps} />}
      <CommentComposer
        comments={post.comments ?? []}
        error={addCommentError}
        isOpen={isCommentSectionOpen}
        isPending={isCommentPending}
        onSubmit={handleCommentSubmit}
      />
      {toggleLikeError
        ? (
            <div className="mx-3 mb-3 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
              {toggleLikeError}
            </div>
          )
        : null}
    </motion.article>
  );
};

export const DashboardPostCard = memo(DashboardPostCardComponent);
DashboardPostCard.displayName = 'DashboardPostCard';
