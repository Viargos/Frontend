'use client';

import { Badge, ChatBubbleIcon, HeartIcon, ImageIcon } from '@/modules/common';

type JourneyPostsSectionProps = {
  journeyTitle: string;
  mode?: 'loading' | 'error' | 'empty' | 'list';
};

type MockPost = {
  author: string;
  commentCount: number;
  description: string;
  id: string;
  likeCount: number;
  mediaCount: number;
};

const MOCK_POSTS: MockPost[] = [
  {
    author: 'Traveler',
    commentCount: 4,
    description: 'Sunrise view over the river and old city walk.',
    id: 'post-1',
    likeCount: 18,
    mediaCount: 3,
  },
  {
    author: 'Traveler',
    commentCount: 2,
    description: 'Street-food stop with local recommendations.',
    id: 'post-2',
    likeCount: 11,
    mediaCount: 1,
  },
];

export const JourneyPostsSection = (props: JourneyPostsSectionProps) => {
  const {
    journeyTitle,
    mode = 'empty',
  } = props;

  if (mode === 'loading') {
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
              <div className="mb-4 h-48 rounded-2xl bg-gray-200" />
              <div className="space-y-3">
                <div className="h-4 w-4/5 rounded bg-gray-200" />
                <div className="h-4 w-full rounded bg-gray-200" />
                <div className="h-4 w-2/3 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'error') {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
        <div className="py-4 text-center">
          <h3 className="text-lg font-semibold text-red-900">Failed to load memories</h3>
          <p className="mt-1 text-sm text-red-700">Please try again in a moment.</p>
        </div>
      </div>
    );
  }

  if (mode === 'empty') {
    return (
      <div className="rounded-3xl border border-dashed border-white/12 bg-white/[0.04] p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.07] text-[#f8d775] shadow-[0_12px_30px_-20px_rgba(0,0,0,0.85)]">
          <ImageIcon size={22} />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-100">No memories shared yet</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
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
          <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">Social highlights</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-100">Journey memories</h2>
          <p className="mt-1 text-sm text-slate-400">Recent posts and shared moments connected to this journey.</p>
        </div>
        <Badge className="border-white/10 bg-white/[0.06] text-slate-200" variant="muted">
          {MOCK_POSTS.length}
          {' '}
          memories
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {MOCK_POSTS.map(post => (
          <article key={post.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_24px_60px_-36px_rgba(0,0,0,0.9)] transition-all hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.06]">
            <div className="h-52 bg-[linear-gradient(180deg,rgba(15,23,42,0.94)_0%,rgba(30,41,59,0.78)_100%)] p-4">
              <div className="flex h-full items-end justify-between rounded-[20px] border border-white/10 bg-white/[0.05] p-4 backdrop-blur-sm">
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">Memory</p>
                  <p className="mt-1 text-sm font-medium text-slate-300">{journeyTitle}</p>
                </div>
                <Badge className="border-white/10 bg-white/[0.08] text-slate-200" variant="muted">
                  <ImageIcon size={12} />
                  {post.mediaCount}
                  {' '}
                  media
                </Badge>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.08] text-sm font-semibold text-slate-100">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">{post.author}</p>
                  <p className="text-xs text-slate-400">Shared with this journey</p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-400">{post.description}</p>

              <div className="mt-5 flex items-center gap-4 border-t border-white/10 pt-4 text-sm text-slate-400">
                <div className="inline-flex items-center gap-2">
                  <HeartIcon size={14} />
                  {post.likeCount}
                </div>
                <div className="inline-flex items-center gap-2">
                  <ChatBubbleIcon size={14} />
                  {post.commentCount}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
