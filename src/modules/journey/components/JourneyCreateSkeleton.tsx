import { Skeleton } from '@/modules/common';

export function JourneyCreateSkeleton() {
  return (
    <div aria-busy="true" className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6" role="status">
      <div className="relative overflow-hidden rounded-2xl">
        <Skeleton className="h-64 w-full rounded-none sm:h-80 lg:h-96" />
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="w-full max-w-xl space-y-3">
            <Skeleton className="mx-auto h-12 w-full rounded-xl bg-white/80" />
            <Skeleton className="mx-auto h-4 w-4/5 bg-white/70" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="mt-3 h-4 w-3/4" />
            <div className="mt-4 flex gap-2 overflow-hidden">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton className="h-9 w-20 rounded-2xl" key={`journey-day-skeleton-${index + 1}`} />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <Skeleton className="h-7 w-44" />
            <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div className="flex flex-col items-center gap-2" key={`journey-category-skeleton-${index + 1}`}>
                  <Skeleton className="h-14 w-14 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <Skeleton className="h-7 w-52" />
            <div className="mt-4 space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4" key={`journey-place-input-skeleton-${index + 1}`}>
                  <Skeleton className="h-5 w-2/5" />
                  <Skeleton className="mt-3 h-10 w-full rounded-lg" />
                  <Skeleton className="mt-2 h-10 w-full rounded-lg" />
                  <Skeleton className="mt-2 h-20 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="mt-4 h-[520px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
