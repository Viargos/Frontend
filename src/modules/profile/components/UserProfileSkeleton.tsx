import { Skeleton } from '@/modules/common';

export function UserProfileSkeleton() {
  return (
    <div aria-busy="true" className="flex w-full flex-1 flex-col items-start gap-6" role="status">
      <div className="flex w-full flex-col items-start justify-center overflow-hidden rounded-md bg-white shadow-lg">
        <div className="relative h-32 w-full sm:h-40 md:h-48 lg:h-56">
          <Skeleton className="h-full w-full rounded-none" />
        </div>

        <div className="-mt-12 flex w-full flex-col items-center justify-start gap-4 px-4 pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:px-6 sm:pb-6 lg:gap-10 xl:gap-16">
          <div className="flex flex-col items-center gap-3 sm:items-start">
            <Skeleton className="h-24 w-24 rounded-full sm:h-28 sm:w-28 lg:h-32 lg:w-32" />
            <Skeleton className="h-8 w-44 sm:h-9 sm:w-52 lg:h-10 lg:w-60" />
            <Skeleton className="h-4 w-32 sm:w-40" />
            <div className="flex w-full max-w-xs flex-col gap-2 sm:max-w-sm lg:max-w-md">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:items-end">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:gap-8">
              {['posts', 'journeys', 'followers', 'following'].map(statKey => (
                <div className="flex min-w-0 flex-col items-center gap-1" key={`user-profile-stat-${statKey}`}>
                  <Skeleton className="h-5 w-10 sm:h-6 sm:w-12" />
                  <Skeleton className="h-4 w-14 sm:w-16" />
                </div>
              ))}
            </div>
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="flex w-full items-center gap-8 border-b border-gray-200 px-4 sm:px-6">
        <Skeleton className="mb-3 h-6 w-20" />
        <Skeleton className="mb-3 h-6 w-16" />
        <Skeleton className="mb-3 h-6 w-14" />
      </div>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, index) => (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm" key={`user-profile-post-skeleton-${index + 1}`}>
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="space-y-2 p-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex items-center justify-between pt-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
