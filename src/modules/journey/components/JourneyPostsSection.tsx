'use client';

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
      <div className="space-y-4 sm:space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-2 h-6 w-40 animate-pulse rounded bg-gray-200 sm:h-8 sm:w-48" />
          <div className="mx-auto h-4 w-24 animate-pulse rounded bg-gray-200 sm:w-32" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map(item => (
            <div key={item} className="animate-pulse rounded-sm bg-white p-2 shadow-md sm:p-3">
              <div className="mb-2 aspect-[4/3] rounded-sm bg-gray-200 sm:mb-3 sm:aspect-square" />
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-gray-200 sm:h-4" />
                <div className="h-3 w-3/4 rounded bg-gray-200 sm:h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'error') {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="py-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <span className="text-lg text-red-600">!</span>
          </div>
          <h3 className="mb-1 text-lg font-medium text-gray-900">Failed to load posts</h3>
          <p className="text-sm text-gray-500">Please try again.</p>
        </div>
      </div>
    );
  }

  if (mode === 'empty') {
    return (
      <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 shadow-sm sm:p-6 md:p-8">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md sm:mb-4 sm:h-14 sm:w-14 md:h-16 md:w-16">
            <span className="text-lg text-blue-600 sm:text-xl md:text-2xl">◉</span>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 sm:text-xl">No Posts Yet</h3>
          <p className="mx-auto mb-4 max-w-md px-2 text-sm text-gray-600 sm:text-base">
            No posts have been shared for
            {' '}
            {journeyTitle}
            {' '}
            yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0,0,0,.05) 35px, rgba(0,0,0,.05) 70px)',
          }}
        />
      </div>

      <div className="relative mb-6 sm:mb-8 md:mb-10 lg:mb-12">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-gray-800 sm:text-3xl md:text-4xl">Journey Memories</h2>
          <div className="flex items-center justify-center space-x-2">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-gray-300 sm:w-12 md:w-16" />
            <p className="text-xs text-gray-500 italic sm:text-sm">
              {MOCK_POSTS.length}
              {' '}
              memories captured
            </p>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-gray-300 sm:w-12 md:w-16" />
          </div>
        </div>
      </div>

      <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4 2xl:grid-cols-4">
        {MOCK_POSTS.map((post, index) => (
          <div key={post.id} className="group relative" style={{ animation: `floatIn 0.6s ease-out ${index * 0.1}s both` }}>
            <div className="cursor-pointer rounded-sm bg-white p-2 pb-4 shadow-lg transition-all duration-300 hover:shadow-2xl sm:p-3 sm:pb-6 md:pb-8">
              <div className="relative mb-2 aspect-[4/3] overflow-hidden rounded-sm bg-gray-100 sm:mb-3 sm:aspect-square">
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                  <span className="text-gray-300">MEDIA</span>
                </div>

                {post.mediaCount > 1
                  ? (
                      <div className="absolute top-1.5 right-1.5 rounded-full px-1.5 py-0.5 text-[10px] text-white backdrop-blur-sm sm:top-2 sm:right-2 sm:px-2 sm:py-1 sm:text-xs">
                        +
                        {post.mediaCount - 1}
                      </div>
                    )
                  : null}
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <p className="line-clamp-2 text-xs leading-relaxed text-gray-700 sm:text-sm">{post.description}</p>

                <div className="flex items-center space-x-1.5 pt-1 sm:space-x-2 sm:pt-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 sm:h-6 sm:w-6">
                    <span className="text-[10px] text-gray-600 sm:text-xs">{post.author.charAt(0)}</span>
                  </div>
                  <span className="truncate text-[10px] text-gray-500 italic sm:text-xs">
                    by
                    {post.author}
                  </span>
                </div>

                <div className="flex items-center space-x-3 pt-1 text-[10px] text-gray-500 sm:space-x-4 sm:pt-2 sm:text-xs">
                  <div className="flex items-center space-x-1">
                    <span></span>
                    <span>{post.likeCount}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span></span>
                    <span>{post.commentCount}</span>
                  </div>
                </div>
              </div>

              <div className="absolute right-0 bottom-0 hidden h-0 w-0 border-b-[15px] border-l-[15px] border-b-gray-100 border-l-transparent opacity-0 transition-opacity group-hover:opacity-100 md:block lg:border-b-[20px] lg:border-l-[20px]" />
            </div>

            <div className="absolute top-[-6px] right-6 hidden h-2.5 w-2.5 rounded-full bg-[#160E53] opacity-0 transition-opacity group-hover:opacity-100 sm:block md:top-[-8px] md:right-8 md:h-3 md:w-3" />
          </div>
        ))}
      </div>

      <style jsx>
        {`
        @keyframes floatIn {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}
      </style>
    </div>
  );
};
