import { Skeleton } from '@/modules/common';

export function JourneyDetailSkeleton() {
  return (
    <div aria-busy="true" className="max-w-none flex-1 bg-linear-to-b from-slate-50 via-white to-slate-100 p-4 sm:p-6" role="status">
      <div className="mb-6 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-900 p-5 shadow-sm sm:mb-8 sm:p-6">
        <Skeleton className="h-10 w-24 rounded-full bg-white/20" />
        <Skeleton className="mt-16 h-10 w-2/5 bg-white/20" />
        <Skeleton className="mt-4 h-5 w-3/5 bg-white/20" />
        <div className="mt-6 flex gap-3">
          <Skeleton className="h-18 w-32 rounded-2xl bg-white/20" />
          <Skeleton className="h-18 w-32 rounded-2xl bg-white/20" />
          <Skeleton className="h-18 w-32 rounded-2xl bg-white/20" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.75fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Skeleton className="h-4 w-28" />
                <Skeleton className="mt-3 h-8 w-52" />
                <Skeleton className="mt-2 h-4 w-72" />
              </div>
              <Skeleton className="h-10 w-32 rounded-full" />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4" key={`journey-stat-skeleton-${index + 1}`}>
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="mt-4 h-8 w-16" />
                  <Skeleton className="mt-2 h-4 w-28" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-3 h-8 w-56" />
              <Skeleton className="mt-2 h-4 w-72" />
            </div>

            <div className="p-5 sm:p-6">
              <div className="mb-6 flex gap-3 overflow-hidden">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton className="h-20 w-40 rounded-2xl" key={`journey-tab-skeleton-${index + 1}`} />
                ))}
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="mt-4 h-7 w-56" />
                <Skeleton className="mt-2 h-4 w-72" />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Skeleton className="h-18 rounded-2xl bg-white" />
                  <Skeleton className="h-18 rounded-2xl bg-white" />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div className="rounded-3xl border border-slate-200 bg-white p-4" key={`journey-place-skeleton-${index + 1}`}>
                    <Skeleton className="h-5 w-32" />
                    <div className="mt-4 grid gap-4 lg:grid-cols-[220px_1fr]">
                      <Skeleton className="h-48 rounded-2xl" />
                      <div>
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="mt-3 h-4 w-48" />
                        <Skeleton className="mt-4 h-4 w-full" />
                        <Skeleton className="mt-2 h-4 w-5/6" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-4 w-28" />
                <Skeleton className="mt-3 h-8 w-56" />
              </div>
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <div className="rounded-3xl border border-slate-200 bg-white p-4" key={`journey-post-skeleton-${index + 1}`}>
                  <Skeleton className="h-48 w-full rounded-2xl" />
                  <Skeleton className="mt-4 h-4 w-24" />
                  <Skeleton className="mt-3 h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-5/6" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-3 h-8 w-40" />
          <Skeleton className="mt-2 h-4 w-56" />
          <Skeleton className="mt-6 h-72 w-full rounded-[24px]" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton className="h-18 w-full rounded-2xl" key={`journey-map-location-skeleton-${index + 1}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
