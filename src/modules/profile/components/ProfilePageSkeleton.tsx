type SkeletonBlockProps = {
  className: string;
};

function SkeletonBlock(props: SkeletonBlockProps) {
  return <div className={`animate-pulse rounded-md bg-gray-200 ${props.className}`} />;
}

function ProfileJourneyCardSkeleton(props: { keyId: number }) {
  return (
    <div
      key={props.keyId}
      className="group h-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
    >
      <div className="flex h-full flex-col p-4">
        <div className="relative mb-4 h-[200px] w-full flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
          <SkeletonBlock className="h-full w-full rounded-xl" />
        </div>

        <div className="flex flex-1 flex-col justify-between">
          <div className="space-y-3">
            <SkeletonBlock className="h-5 w-28" />
            <div className="flex items-start justify-between">
              <SkeletonBlock className="h-6 w-3/4" />
            </div>
            <div className="flex items-center gap-2">
              <SkeletonBlock className="h-4 w-full" />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <SkeletonBlock className="h-6 w-24 rounded-full" />
            <SkeletonBlock className="h-6 w-32 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfilePageSkeleton() {
  return (
    <div className="flex w-full flex-1 flex-col items-start gap-6">
      <div className="flex w-full flex-col items-start justify-center overflow-hidden rounded-md bg-white shadow-lg">
        <div className="relative h-32 w-full sm:h-40 md:h-48 lg:h-56">
          <SkeletonBlock className="h-full w-full rounded-none" />
        </div>

        <div className="-mt-12 flex w-full flex-col items-center justify-start gap-4 px-4 pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:px-6 sm:pb-6 lg:gap-10 xl:gap-16">
          <div className="flex flex-col items-center justify-center gap-2 sm:items-start sm:gap-3">
            <div className="relative h-24 w-24 rounded-lg sm:h-28 sm:w-28 lg:h-32 lg:w-32">
              <div className="absolute top-0 left-0 h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32">
                <SkeletonBlock className="absolute top-0 left-0 h-24 w-24 rounded-lg sm:h-28 sm:w-28 lg:h-32 lg:w-32" />
                <SkeletonBlock className="absolute top-2 left-2 h-20 w-20 rounded-full sm:h-24 sm:w-24 lg:h-28 lg:w-28" />
              </div>
            </div>

            <SkeletonBlock className="h-8 w-44 sm:h-9 sm:w-52 lg:h-10 lg:w-60" />

            <div className="flex max-w-xs flex-col gap-2 sm:max-w-sm lg:max-w-md">
              <SkeletonBlock className="h-4 w-64 sm:w-72 lg:w-80" />
              <SkeletonBlock className="h-4 w-56 sm:w-64 lg:w-72" />
              <SkeletonBlock className="h-4 w-48 sm:w-56 lg:w-64" />
            </div>

            <SkeletonBlock className="h-4 w-40 sm:w-48" />
            <SkeletonBlock className="h-4 w-52 sm:w-60" />
          </div>

          <div className="flex w-full items-center justify-center gap-3 sm:w-auto sm:justify-start sm:gap-4 md:gap-6 lg:gap-8">
            <div className="flex items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              {['posts', 'journeys', 'followers', 'following'].map(statKey => (
                <div className="flex min-w-0 flex-col items-center gap-1" key={`profile-stat-skeleton-${statKey}`}>
                  <SkeletonBlock className="h-5 w-10 sm:h-6 sm:w-12" />
                  <SkeletonBlock className="h-4 w-14 sm:w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center gap-8 border-b border-gray-200 px-4 sm:px-6">
        <SkeletonBlock className="mb-3 h-6 w-20" />
        <SkeletonBlock className="mb-3 h-6 w-16" />
        <SkeletonBlock className="mb-3 h-6 w-14" />
      </div>

      <div className="flex w-full flex-col items-start gap-4">
        <div className="flex w-full items-center justify-center gap-2.5">
          <SkeletonBlock className="h-8 w-44 sm:w-52" />
          <SkeletonBlock className="h-9 w-40" />
        </div>

        <div className="flex w-full flex-col items-start gap-3">
          <div className="grid w-full grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(cardId => (
              <ProfileJourneyCardSkeleton key={cardId} keyId={cardId} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
