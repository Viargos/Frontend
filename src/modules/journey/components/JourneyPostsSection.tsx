'use client';

import Image from 'next/image';
import { Badge, ImageIcon } from '@/modules/common';
import { useJourneyPosts } from '@/modules/journey/hooks/use-journey-posts';

type JourneyPostsSectionProps = {
  journeyId: string;
  journeyImageSrc?: string;
  journeyTitle: string;
};

export const JourneyPostsSection = (props: JourneyPostsSectionProps) => {
  const {
    journeyId,
    journeyImageSrc,
    journeyTitle,
  } = props;
  
  const { posts, isLoading, isError, error } = useJourneyPosts(journeyId);
  const billboardImageSrc = journeyImageSrc || '/london.png';

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-4 w-56 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="h-7 w-24 animate-pulse rounded-full bg-gray-200" />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[1, 2, 3, 4].map(item => (
            <div key={item} className="animate-pulse rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="h-72 rounded-2xl bg-gray-200" />
              <div className="mt-4 h-5 w-4/5 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
        <div className="py-4 text-center">
          <h3 className="text-lg font-semibold text-red-900">Failed to load memories</h3>
          <p className="mt-1 text-sm text-red-700">{error || 'Please try again in a moment.'}</p>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="journey-planner-empty-state rounded-3xl border border-dashed p-8 text-center">
        <div className="journey-planner-icon-tile mx-auto flex h-14 w-14 items-center justify-center rounded-2xl">
          <ImageIcon size={22} />
        </div>
        <h3 className="journey-planner-title mt-4 text-lg font-semibold">No memories shared yet</h3>
        <p className="journey-planner-copy mx-auto mt-2 max-w-md text-sm leading-6">
          Posts connected to
          {' '}
          {journeyTitle}
          {' '}
          will appear here once travelers start sharing moments from the trip.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="journey-planner-label text-xs font-semibold tracking-[0.22em] uppercase">Social highlights</p>
          <h2 className="journey-planner-title mt-1 text-2xl font-semibold tracking-tight">Journey memories</h2>
          <p className="journey-planner-copy mt-1 text-sm">Recent posts and shared moments connected to this journey.</p>
        </div>
        <Badge variant="muted">
          {posts.length}
          {' '}
          memories
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-5 rounded-[26px] p-3 sm:p-4 lg:grid-cols-2">
        {posts.map((post, index) => {
          const firstMedia = post.media?.[0];
          const src = firstMedia ? (firstMedia.thumbnailUrl || firstMedia.url) : billboardImageSrc;

          return (
            <article
              key={post.id}
              className={`journey-memory-card relative rounded-[24px] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${index % 2 === 0 ? 'lg:rotate-[-0.5deg]' : 'lg:rotate-[0.5deg]'}`}
            >
              <div className="journey-memory-pin" aria-hidden="true" />
              <div className="journey-memory-photo relative min-h-[260px] overflow-hidden rounded-[18px] sm:min-h-[320px]">
                <Image
                  alt={post.description}
                  className="object-cover"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  src={src}
                  unoptimized
                />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

