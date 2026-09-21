'use client';

import type { DashboardParityState } from '@/modules/dashboard/constants/dashboard-parity.types';
import type { DashboardFeedModel } from '@/modules/dashboard/types/dashboard.types';
import { gsap } from 'gsap';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useAuthSession } from '@/modules/auth';
import { useIntersectionObserver } from '@/modules/common/hooks';
import { useDashboardPosts } from '@/modules/dashboard/hooks/use-dashboard-posts';
import { DashboardCreatePostModal } from './DashboardCreatePostModal';
import { DashboardFeedSkeleton } from './DashboardFeedSkeleton';
import { DashboardPostCard } from './DashboardPostCard';

type DashboardFeedProps = {
  initialFeed: DashboardFeedModel | null;
  parityState?: DashboardParityState;
};

const composerPrompts = [
  'Where will your next adventure take you?',
  'Share your latest journey',
  'What place are you exploring?',
  'Where have you been lately?',
  'Where are you going?',
] as const;

const TYPING_SECONDS_PER_CHARACTER = 0.095;
const DELETING_SECONDS_PER_CHARACTER = 0.05;

const DashboardFeedComposer = () => {
  const { session } = useAuthSession();
  const user = session.user;
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const promptRef = useRef<HTMLSpanElement | null>(null);
  const cursorRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const promptElement = promptRef.current;
    const cursorElement = cursorRef.current;

    if (!promptElement || !cursorElement) {
      return;
    }

    const media = gsap.matchMedia();

    media.add('(prefers-reduced-motion: no-preference)', () => {
      const typingTimeline = gsap.timeline({ repeat: -1 });

      composerPrompts.forEach((prompt, promptIndex) => {
        const typingState = { characterCount: 0 };
        const readingPause = promptIndex === 1 ? 5.5 : 3.25;

        typingTimeline
          .to(typingState, {
            characterCount: prompt.length,
            duration: prompt.length * TYPING_SECONDS_PER_CHARACTER,
            ease: 'none',
            onUpdate: () => {
              promptElement.textContent = prompt.slice(0, Math.round(typingState.characterCount));
            },
            snap: { characterCount: 1 },
          })
          .to({}, { duration: readingPause })
          .to(typingState, {
            characterCount: 0,
            duration: Math.max(prompt.length * DELETING_SECONDS_PER_CHARACTER, 0.8),
            ease: 'none',
            onUpdate: () => {
              promptElement.textContent = prompt.slice(0, Math.round(typingState.characterCount));
            },
            snap: { characterCount: 1 },
          })
          .to({}, { duration: 0.9 });
      });

      gsap.to(cursorElement, {
        autoAlpha: 0,
        duration: 1,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });

      return () => {
        typingTimeline.kill();
      };
    });

    media.add('(prefers-reduced-motion: reduce)', () => {
      promptElement.textContent = composerPrompts[0];
      gsap.set(cursorElement, { autoAlpha: 0 });
    });

    return () => {
      media.revert();
    };
  }, []);

  return (
    <div className="dashboard-feed-composer border-b border-gray-200 bg-white px-4 py-4">
      <button
        className="flex w-full items-start gap-3 rounded-2xl px-1 py-1 text-left transition-colors hover:bg-gray-50"
        type="button"
        onClick={() => setShowCreatePostModal(true)}
      >
        {user?.profileImage
          ? (
              <Image
                alt={user.username}
                className="h-10 w-10 shrink-0 rounded-full object-cover"
                height={40}
                src={user.profileImage}
                unoptimized
                width={40}
              />
            )
          : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-900 text-sm font-bold text-white">
                {user?.username?.charAt(0).toUpperCase() ?? 'V'}
              </span>
            )}

        <span aria-hidden="true" className="mt-2.5 min-w-0 flex-1 truncate text-[17px] text-gray-500">
          <span ref={promptRef}>{composerPrompts[0]}</span>
          <span ref={cursorRef} className="ml-0.5 inline-block h-[1.15em] w-0.5 translate-y-[0.16em] bg-gray-400" />
        </span>
        <span className="sr-only">Create a travel post</span>

        <span className="mt-1 hidden rounded-full bg-[#160E53] px-5 py-2 text-sm font-semibold text-white sm:inline-flex">
          Post
        </span>
      </button>

      <DashboardCreatePostModal isOpen={showCreatePostModal} onClose={() => setShowCreatePostModal(false)} />
    </div>
  );
};

export const DashboardFeed = (props: DashboardFeedProps) => {
  const { initialFeed, parityState } = props;
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const {
    posts,
    hasMore,
    isLoadingMore,
    loadMore,
    error,
    isError,
    isLoading,
    retry,
    retryLoadMore,
  } = useDashboardPosts(initialFeed);

  useIntersectionObserver(sentinelRef, {
    enabled: !parityState && hasMore && !isLoading && posts.length > 0,
    onIntersect: () => {
      void loadMore();
    },
    rootMargin: '120px',
    threshold: 0,
  });

  useEffect(() => {
    if (parityState) {
      return;
    }

    window.scrollTo({ behavior: 'auto', top: 0 });
  }, [parityState]);

  if (isLoading && posts.length === 0) {
    return <DashboardFeedSkeleton embedded />;
  }

  if (isError && posts.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="mb-3 text-red-700">{error ?? 'Failed to load posts'}</p>
          <button
            className="rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
            onClick={() => void retry()}
            type="button"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="py-16 text-center">
        <h3 className="mb-2 text-lg font-medium text-gray-900">No posts found</h3>
        <p className="text-gray-500">Be the first to share your travel experiences!</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mx-auto max-w-full">
        <DashboardFeedComposer />

        {posts.map(post => (
          <div key={post.id}>
            <DashboardPostCard post={post} />
          </div>
        ))}

        {error && posts.length > 0
          ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <div className="flex items-center justify-between gap-3">
                  <span>{error}</span>
                  {hasMore
                    ? (
                        <button
                          className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-red-700"
                          onClick={() => void retryLoadMore()}
                          type="button"
                        >
                          Retry
                        </button>
                      )
                    : null}
                </div>
              </div>
            )
          : null}

        {isLoadingMore
          ? (
              <div className="flex justify-center py-8">
                <div className="text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
                  <span className="sr-only">Fetching more posts</span>
                </div>
              </div>
            )
          : null}

        {hasMore && !isLoadingMore
          ? (
              <div ref={sentinelRef} className="flex h-[88px] items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-gray-500" />
              </div>
            )
          : null}

        {!hasMore && posts.length > 0
          ? (
              <div className="py-8 text-center">
                <p className="text-gray-500">
                  You&apos;ve reached the end!
                </p>
              </div>
            )
          : null}
      </div>
    </div>
  );
};
