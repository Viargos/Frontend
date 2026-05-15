'use client';

import type { FormEvent } from 'react';
import type {
  DashboardPost,
  DashboardPostComment,
} from '@/modules/dashboard/types/dashboard.types';
import * as motion from 'framer-motion/client';
import Image from 'next/image';
import Link from 'next/link';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuthSession } from '@/modules/auth';
import { formatPostTimestamp } from '@/modules/dashboard/helpers/date.helper';
import { usePostActions } from '@/modules/dashboard/hooks/use-post-actions';
import { usePostComments } from '@/modules/dashboard/hooks/use-post-comments';
import {
  ChatIcon,
  ChevronRightIcon,
  ClockIcon,
  HeartIcon,
  MapPinIcon,
  SendIcon,
} from './dashboard-icons';
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
  allComments: DashboardPostComment[];
  currentUser: { username: string; profileImage?: string | null } | null;
  error: string | null;
  isLoadingComments: boolean;
  isOpen: boolean;
  isPending: boolean;
  onSubmit: (content: string) => void;
};

function UserAvatar(props: {
  profileImage?: string;
  ring?: 'white' | 'blue';
  size: 'sm' | 'md';
  username: string;
}) {
  const { profileImage, ring, size, username } = props;
  const dimensionClassName = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const textClassName = size === 'sm' ? 'text-xs' : 'text-sm';
  const ringClassName = ring === 'white' ? 'ring-2 ring-white/80' : ring === 'blue' ? 'ring-2 ring-blue-100' : '';

  if (profileImage) {
    return (
      <Image
        alt={username}
        className={`${dimensionClassName} shrink-0 rounded-full object-cover ${ringClassName}`}
        height={size === 'sm' ? 32 : 40}
        src={profileImage}
        unoptimized
        width={size === 'sm' ? 32 : 40}
      />
    );
  }

  return (
    <div
      className={`${dimensionClassName} flex shrink-0 items-center justify-center rounded-full bg-blue-900 ${ringClassName}`}
    >
      <span className={`font-bold text-white ${textClassName}`}>
        {username.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

function JourneyPillLink(props: { journeyId: string }) {
  const { journeyId } = props;
  return (
    <Link
      className="dashboard-post-journey-pill group inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]"
      href={`/journey/${journeyId}`}
    >
      <span>See full journey</span>
      <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
    </Link>
  );
}

function ActionBar(
  props: Pick<
    PostLayoutProps,
    | 'isCommentSectionOpen'
    | 'isLikePending'
    | 'isLiked'
    | 'commentCount'
    | 'likeCount'
    | 'onCommentClick'
    | 'onLikeClick'
  >,
) {
  const {
    isCommentSectionOpen,
    isLikePending,
    isLiked,
    commentCount,
    likeCount,
    onCommentClick,
    onLikeClick,
  } = props;

  return (
    <div className="dashboard-post-action-bar flex items-center gap-2 border-t px-4 py-2.5">
      <motion.button
        className={`dashboard-post-action-button flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-200 ${
          isLiked
            ? 'dashboard-post-action-button-liked'
            : ''
        }`}
        transition={{ duration: 0.2 }}
        type="button"
        whileTap={{ scale: 0.88 }}
        disabled={isLikePending}
        onClick={onLikeClick}
      >
        <motion.span
          animate={isLiked ? { scale: [1, 1.4, 1] } : { scale: 1 }}
          transition={{ duration: 0.25 }}
        >
          <HeartIcon
            className={`h-4 w-4 transition-all duration-200 ${isLiked ? 'fill-current' : ''}`}
          />
        </motion.span>
        <span>{likeCount}</span>
      </motion.button>

      <button
        className={`dashboard-post-action-button flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-200 ${
          isCommentSectionOpen
            ? 'dashboard-post-action-button-active'
            : ''
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
  const {
    isCommentSectionOpen,
    isLikePending,
    isLiked,
    commentCount,
    likeCount,
    onCommentClick,
    onLikeClick,
    post,
    timeAgo,
  } = props;

  return (
    <>
      <div className="relative">
        <DashboardMediaCarousel media={post.media} />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-linear-to-t from-black/70 to-transparent" />

        {post.location && !post.journey && (
          <div className="dashboard-post-floating-chip absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-white">
            <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-white" />
            <span className="max-w-[140px] truncate">{post.location}</span>
          </div>
        )}

        <button
          className="group/avatar absolute bottom-3 left-3 z-20 flex items-center gap-2.5"
          type="button"
        >
          <UserAvatar
            profileImage={post.user.profileImage}
            ring="white"
            size="sm"
            username={post.user.username}
          />
          <span className="text-sm font-semibold text-white drop-shadow-md transition-all group-hover/avatar:underline">
            {post.user.username}
          </span>
        </button>
      </div>

      <div className="dashboard-post-body px-4 pt-4 pb-1">
        {post.journey && (
          <div className="mb-2.5">
            <div className="flex items-center justify-between gap-3">
              <span
                className="dashboard-post-accent flex min-w-0 items-center gap-1.5 text-xs font-medium"
                title={post.journey.title}
              >
                <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{post.journey.title}</span>
              </span>
              <JourneyPillLink journeyId={post.journey.id} />
            </div>
            <p className="dashboard-post-muted mt-1.5 flex items-center gap-1.5 text-xs">
              <ClockIcon className="h-3.5 w-3.5 shrink-0" />
              {timeAgo}
            </p>
          </div>
        )}
        {post.location && !post.journey && (
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
            <p className="dashboard-post-accent flex items-center gap-1.5 text-xs" title={`${post.location} - ${timeAgo}`}>
              <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="max-w-[180px] truncate" title={`${post.location} - ${timeAgo}`}>{post.location}</span>
            </p>
          </div>
        )}

        <p className="dashboard-post-text text-sm leading-relaxed">{post.description}</p>
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
  const {
    isCommentSectionOpen,
    isLikePending,
    isLiked,
    commentCount,
    likeCount,
    onCommentClick,
    onLikeClick,
    post,
    timeAgo,
  } = props;

  return (
    <>
      <div className="dashboard-post-body flex items-start">
        <div className="w-1 shrink-0 rounded-l-2xl bg-blue-900" />

        <div className="min-w-0 flex-1 px-4 pt-4 pb-2">
          <div className="mb-3 flex items-start justify-between gap-3">
            <button
              className="flex w-[178px] min-w-0 items-center gap-3 transition-opacity hover:opacity-80"
              type="button"
            >
              <UserAvatar
                profileImage={post.user.profileImage}
                ring="blue"
                size="md"
                username={post.user.username}
              />
              <div className="min-w-0 text-left">
                <p className="dashboard-post-title truncate text-sm font-semibold" title={post.user.username}>{post.user.username}</p>
                <p className="dashboard-post-muted mt-0.5 flex items-center gap-1 text-xs" title={timeAgo}>
                  <ClockIcon className="h-3 w-3 shrink-0" />
                  <span title={timeAgo}>{timeAgo}</span>
                </p>
              </div>
            </button>

            {post.journey && (
              <div className="shrink-0">
                <JourneyPillLink journeyId={post.journey.id} />
              </div>
            )}
          </div>

          {(post.location || post.journey) && (
            <div className="mb-2.5 flex items-center gap-1.5">
              <MapPinIcon className="dashboard-post-accent h-3.5 w-3.5 shrink-0" />
              {post.journey && (
                <button
                  className="dashboard-post-accent truncate text-xs font-semibold underline-offset-2 hover:underline"
                  type="button"
                >
                  {post.journey.title}
                </button>
              )}
              {post.location && (
                <span className="dashboard-post-muted truncate text-xs">{post.location}</span>
              )}
            </div>
          )}

          <p className="dashboard-post-text text-sm leading-relaxed">{post.description}</p>
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
  const { allComments, currentUser, error, isLoadingComments, isOpen, isPending, onSubmit } = props;
  const [commentText, setCommentText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom whenever comments change
  useEffect(() => {
    if (scrollRef.current && allComments.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allComments.length]);

  // Focus input when comment section opens
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 120);

    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const content = commentText.trim();
      if (!content || isPending) {
        return;
      }
      onSubmit(content);
      setCommentText('');
    },
    [commentText, isPending, onSubmit],
  );

  if (!isOpen) {
    return null;
  }

  const displayName = currentUser?.username ?? 'You';
  const displayImage = currentUser?.profileImage ?? undefined;

  return (
    <motion.div
      animate={{ opacity: 1, height: 'auto' }}
      className="dashboard-post-divider border-t"
      exit={{ opacity: 0, height: 0 }}
      initial={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* Scrollable comment list */}
      <div
        ref={scrollRef}
        className="max-h-52 space-y-1 overflow-y-auto scroll-smooth px-4 pt-3 pb-1"
        style={{ scrollbarColor: '#e0e7ff transparent', scrollbarWidth: 'thin' }}
      >
        {isLoadingComments
          ? (
              <div className="flex items-center justify-center py-6">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
                <span className="dashboard-post-muted ml-2 text-xs">Loading comments...</span>
              </div>
            )
          : allComments.length === 0
            ? (
                <p className="dashboard-post-muted py-4 text-center text-xs">No comments yet. Be the first!</p>
              )
            : (
                allComments.map((comment) => {
                  const commentUsername = comment.user?.username ?? 'Unknown user';

                  return (
                    <div key={comment.id} className="flex items-start gap-2.5 py-1">
                      <UserAvatar
                        profileImage={comment.user?.profileImage}
                        size="sm"
                        username={commentUsername}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="dashboard-post-comment-bubble inline-block max-w-full rounded-2xl rounded-tl-sm px-3 py-2">
                          <span className="dashboard-post-accent mr-1.5 text-xs font-semibold">
                            {commentUsername}
                          </span>
                          <span className="dashboard-post-text text-sm wrap-break-word">{comment.content}</span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 px-1">
                          <span className="dashboard-post-muted text-[10px]">
                            <span title={formatPostTimestamp(comment.createdAt)}>{formatPostTimestamp(comment.createdAt)}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
      </div>

      {/* Input row */}
      <div className="dashboard-post-divider border-t px-4 pt-2 pb-3">
        <form className="flex items-center gap-2" onSubmit={event => void handleSubmit(event)}>
          <UserAvatar profileImage={displayImage} size="sm" username={displayName} />
          <input
            ref={inputRef}
            className="dashboard-post-input h-9 flex-1 rounded-full border px-4 text-sm transition-all outline-none disabled:opacity-60"
            disabled={isPending}
            maxLength={500}
            placeholder="Add a comment..."
            type="text"
            value={commentText}
            onChange={event => setCommentText(event.target.value)}
          />
          <motion.button
            className="dashboard-post-send-button flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPending || commentText.trim().length === 0}
            transition={{ duration: 0.15 }}
            type="submit"
            whileTap={{ scale: 0.88 }}
          >
            {isPending
              ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )
              : (
                  <SendIcon className="h-3.5 w-3.5 translate-x-[-px] rotate-45" />
                )}
          </motion.button>
        </form>
        {error ? <p className="mt-1.5 pl-10 text-xs text-red-500">{error}</p> : null}
      </div>
    </motion.div>
  );
}

const DashboardPostCardComponent = (props: DashboardPostCardProps) => {
  const { post } = props;
  const [isCommentSectionOpen, setIsCommentSectionOpen] = useState(false);

  const { session } = useAuthSession();
  const currentUser = session.user;
  const { comments: fetchedComments, hasFetched, isLoadingComments } = usePostComments({
    enabled: isCommentSectionOpen,
    postId: post.id,
  });

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

  const allComments = useMemo<DashboardPostComment[]>(() => {
    if (!hasFetched) {
      return post.comments ?? [];
    }
    const fetchedIds = new Set(fetchedComments.map(comment => comment.id));
    const pendingOrNew = (post.comments ?? []).filter(comment => !fetchedIds.has(comment.id));
    return [...fetchedComments, ...pendingOrNew];
  }, [fetchedComments, post.comments, hasFetched]);

  const handleLikeClick = useCallback(async () => {
    if (isLikePending) {
      return;
    }

    await toggleLike({
      isCurrentlyLiked: post.isLikedByCurrentUser,
      postId: post.id,
    });
  }, [isLikePending, post.id, post.isLikedByCurrentUser, toggleLike]);

  const handleCommentSubmit = useCallback(
    (content: string): void => {
      if (isCommentPending) {
        return;
      }

      void addComment({
        currentUser: currentUser
          ? {
              id: currentUser.id,
              username: currentUser.username,
              profileImage: currentUser.profileImage ?? undefined,
            }
          : undefined,
        payload: { content },
        postId: post.id,
      });
    },
    [addComment, currentUser, isCommentPending, post.id],
  );

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
      className="dashboard-post-card overflow-hidden rounded-xl border transition-all duration-50 hover:shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {hasMedia ? <MediaPost {...sharedProps} /> : <TextPost {...sharedProps} />}

      <CommentComposer
        allComments={allComments}
        currentUser={currentUser}
        error={addCommentError}
        isLoadingComments={isLoadingComments}
        isOpen={isCommentSectionOpen}
        isPending={isCommentPending}
        onSubmit={handleCommentSubmit}
      />

      {toggleLikeError && (
        <div className="mx-3 mb-3 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700" key={toggleLikeError}>
          {toggleLikeError}
        </div>
      )}
    </motion.article>
  );
};

export const DashboardPostCard = memo(DashboardPostCardComponent);
DashboardPostCard.displayName = 'DashboardPostCard';
