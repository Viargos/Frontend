import { Skeleton } from '@/modules/common';

export function JourneyDetailSkeleton() {
  return (
    <div aria-busy="true" className="max-w-none flex-1 bg-gray-50 p-4 sm:p-6" role="status">
      <div className="mb-4 rounded-lg bg-white p-4 shadow-sm sm:p-6">
        <Skeleton className="h-8 w-2/5" />
        <Skeleton className="mt-3 h-4 w-3/5" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-lg bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-6 flex items-center justify-between gap-3">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-9 w-28 rounded-md" />
            </div>
            <div className="mb-6 flex gap-2 overflow-hidden">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton className="h-9 w-20 rounded-full" key={`journey-tab-skeleton-${index + 1}`} />
              ))}
            </div>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4" key={`journey-place-skeleton-${index + 1}`}>
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="mt-2 h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-5/6" />
                  <Skeleton className="mt-3 h-28 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow-sm sm:p-6">
            <Skeleton className="h-6 w-44" />
            <div className="mt-4 space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4" key={`journey-post-skeleton-${index + 1}`}>
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="mt-2 h-4 w-5/6" />
                  <Skeleton className="mt-3 h-40 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-4 shadow-sm sm:p-6">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="mt-4 h-[520px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
