import { Skeleton } from '@/modules/common';

export function JourneyListSkeleton() {
  return (
    <div aria-busy="true" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" role="status">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm" key={`journey-card-skeleton-${index + 1}`}>
            <Skeleton className="h-44 w-full rounded-none" />
            <div className="space-y-3 p-4">
              <Skeleton className="h-6 w-4/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
