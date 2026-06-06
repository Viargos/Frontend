'use client';

import type { ProfilePost, ProfilePostComment } from '@/modules/profile/types/profile.types';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { OverlayModal } from '@/modules/common';
import {
  ChatBubbleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  ImageIcon,
  JourneyIcon,
  SpinnerIcon,
  XIcon,
} from '@/modules/common/icons';
import { useProfilePostComments } from '@/modules/profile/hooks';

type PostDetailModalProps = {
  onClose: () => void;
  post: ProfilePost;
};

type UserAvatarProps = {
  profileImage?: string;
  size?: 'sm' | 'md';
  username: string;
};

function formatDisplayDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatRelativeDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) {
    return 'Just now';
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d`;
  }

  return formatDisplayDate(value);
}

function UserAvatar(props: UserAvatarProps) {
  const { profileImage, size = 'sm', username } = props;
  const dimensionClassName = size === 'sm' ? 'h-9 w-9' : 'h-10 w-10';
  const textClassName = size === 'sm' ? 'text-xs' : 'text-sm';

  if (profileImage) {
    return (
      <Image
        alt={username}
        className={`${dimensionClassName} shrink-0 rounded-full object-cover ring-1 ring-white/70`}
        height={size === 'sm' ? 36 : 40}
        quality={75}
        sizes={size === 'sm' ? '36px' : '40px'}
        src={profileImage}
        width={size === 'sm' ? 36 : 40}
      />
    );
  }

  return (
    <div
      className={`${dimensionClassName} flex shrink-0 items-center justify-center rounded-full bg-slate-900 text-white ring-1 ring-slate-200`}
    >
      <span className={`font-semibold ${textClassName}`}>
        {username.charAt(0).toUpperCase() || 'U'}
      </span>
    </div>
  );
}

function CommentRow(props: { comment: ProfilePostComment }) {
  const { comment } = props;
  const username = comment.user?.username ?? 'Traveler';

  return (
    <div className="flex items-start gap-3">
      <UserAvatar profileImage={comment.user?.profileImage} username={username} />
      <div className="min-w-0 flex-1">
        <div className="inline-block max-w-full rounded-2xl rounded-tl-md bg-slate-100 px-3 py-2">
          <div className="flex max-w-full flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-xs font-semibold text-slate-950">{username}</span>
            {comment.isPending ? <span className="text-[11px] text-slate-500">Sending</span> : null}
          </div>
          <p className="mt-0.5 text-sm leading-relaxed break-words text-slate-700">{comment.content}</p>
        </div>
        <p className="mt-1 px-1 text-[11px] text-slate-500" title={formatDisplayDate(comment.createdAt)}>
          {formatRelativeDate(comment.createdAt)}
        </p>
      </div>
    </div>
  );
}

export function PostDetailModal(props: PostDetailModalProps) {
  const { onClose, post } = props;
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const commentsScrollRef = useRef<HTMLDivElement | null>(null);
  const {
    comments,
    commentsError,
    isLoadingComments,
  } = useProfilePostComments({
    enabled: true,
    postId: post.id,
  });

  const mediaItems = useMemo(
    () => post.mediaUrls.map((url, itemIndex) => ({
      id: `${post.id}-${itemIndex}-${url}`,
      index: itemIndex,
      url,
    })),
    [post.id, post.mediaUrls],
  );
  const hasMedia = mediaItems.length > 0;
  const selectedMediaUrl = hasMedia ? mediaItems[selectedMediaIndex]?.url : undefined;
  const commentCount = Math.max(post.commentCount, comments.length);
  const formattedDate = useMemo(() => formatDisplayDate(post.createdAt), [post.createdAt]);

  useEffect(() => {
    if (commentsScrollRef.current && comments.length > 0) {
      commentsScrollRef.current.scrollTop = commentsScrollRef.current.scrollHeight;
    }
  }, [comments.length]);

  const handlePreviousMedia = () => {
    setSelectedMediaIndex(previous => (
      previous === 0 ? post.mediaUrls.length - 1 : previous - 1
    ));
  };

  const handleNextMedia = () => {
    setSelectedMediaIndex(previous => (
      previous === post.mediaUrls.length - 1 ? 0 : previous + 1
    ));
  };

  return (
    <OverlayModal
      ariaLabel="Post details"
      className="max-h-[94vh] max-w-6xl overflow-hidden rounded-2xl bg-white"
      onClose={onClose}
    >
      <div className="grid max-h-[94vh] min-h-[72vh] grid-cols-1 overflow-hidden lg:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.85fr)]">
        <div className="relative flex min-h-[42vh] items-center justify-center overflow-hidden bg-slate-100 lg:min-h-0">
          {selectedMediaUrl
            ? (
                <>
                  <Image
                    fill
                    aria-hidden="true"
                    alt=""
                    className="scale-110 object-cover opacity-35 blur-2xl"
                    priority
                    quality={45}
                    sizes="(min-width: 1024px) 64vw, 100vw"
                    src={selectedMediaUrl}
                  />
                  <div className="absolute inset-0 bg-white/45" />
                  <Image
                    fill
                    alt={post.description || 'Post image'}
                    className="object-contain"
                    priority
                    quality={85}
                    sizes="(min-width: 1024px) 64vw, 100vw"
                    src={selectedMediaUrl}
                  />
                </>
              )
            : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon className="mb-3 h-12 w-12" />
                  <span className="text-sm font-medium">Text post</span>
                </div>
              )}

          {post.mediaUrls.length > 1
            ? (
                <>
                  <button
                    aria-label="Previous image"
                    className="absolute top-1/2 left-4 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white shadow-lg ring-1 ring-white/15 transition hover:bg-black/65"
                    type="button"
                    onClick={handlePreviousMedia}
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <button
                    aria-label="Next image"
                    className="absolute top-1/2 right-4 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white shadow-lg ring-1 ring-white/15 transition hover:bg-black/65"
                    type="button"
                    onClick={handleNextMedia}
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 ring-1 ring-white/15">
                    {mediaItems.map(mediaItem => (
                      <button
                        key={mediaItem.id}
                        aria-label={`Show image ${mediaItem.index + 1}`}
                        className={`h-2 w-2 rounded-full transition ${
                          mediaItem.index === selectedMediaIndex
                            ? 'bg-white'
                            : 'bg-white/40 hover:bg-white/70'
                        }`}
                        type="button"
                        onClick={() => setSelectedMediaIndex(mediaItem.index)}
                      />
                    ))}
                  </div>
                </>
              )
            : null}
        </div>

        <aside className="flex min-h-0 flex-col bg-white">
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                <span>{formattedDate}</span>
                <span className="flex items-center gap-1">
                  <HeartIcon className="h-3.5 w-3.5" />
                  {post.likeCount}
                </span>
                <span className="flex items-center gap-1">
                  <ChatBubbleIcon className="h-3.5 w-3.5" />
                  {commentCount}
                </span>
              </div>
              {post.journey
                ? (
                    <p className="mt-2 flex min-w-0 items-center gap-1.5 text-sm font-medium text-slate-800">
                      <JourneyIcon className="h-4 w-4 shrink-0 text-slate-500" />
                      <span className="truncate" title={post.journey.title}>{post.journey.title}</span>
                    </p>
                  )
                : null}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {post.journey
                ? (
                    <Link
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
                      href={`/journey/${post.journey.id}`}
                      onClick={onClose}
                    >
                      <JourneyIcon className="h-3.5 w-3.5" />
                      <span>View journey</span>
                    </Link>
                  )
                : null}
              <button
                aria-label="Close post details"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                type="button"
                onClick={onClose}
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <p className="text-sm leading-6 break-words whitespace-pre-wrap text-slate-800">
              {post.description}
            </p>

            <div className="mt-5 border-t border-slate-200 pt-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-950">Comments</h3>
                {isLoadingComments
                  ? <SpinnerIcon className="h-4 w-4 animate-spin text-slate-400" />
                  : null}
              </div>

              <div
                ref={commentsScrollRef}
                className="max-h-[34vh] space-y-4 overflow-y-auto pr-1"
                style={{ scrollbarColor: '#cbd5e1 transparent', scrollbarWidth: 'thin' }}
              >
                {commentsError
                  ? (
                      <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {commentsError}
                      </p>
                    )
                  : comments.length > 0
                    ? comments.map(comment => <CommentRow key={comment.id} comment={comment} />)
                    : (
                        <p className="rounded-lg bg-slate-50 px-3 py-5 text-center text-sm text-slate-500">
                          No comments yet.
                        </p>
                      )}
              </div>
            </div>
          </div>

        </aside>
      </div>
    </OverlayModal>
  );
}
