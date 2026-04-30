import { Skeleton } from '@/modules/common';

export function JourneyCreateSkeleton() {
  return (
    <div aria-busy="true" className="space-y-6 bg-linear-to-b from-slate-50 via-white to-slate-100 p-4 sm:p-6" role="status">
      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.3fr)_420px]">
          <div className="relative min-h-[360px] overflow-hidden bg-slate-900">
            <Skeleton className="h-full min-h-[360px] w-full rounded-none bg-white/10" />
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
              <Skeleton className="h-4 w-28 bg-white/20" />
              <Skeleton className="mt-4 h-12 w-3/4 bg-white/20" />
              <Skeleton className="mt-3 h-5 w-2/3 bg-white/20" />
              <Skeleton className="mt-6 h-10 w-36 rounded-full bg-white/20" />
            </div>
          </div>

          <div className="border-t border-slate-200 bg-white p-6 lg:border-t-0 lg:border-l">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-3 h-8 w-64" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
            <Skeleton className="mt-6 h-14 w-full rounded-2xl" />
            <Skeleton className="mt-4 h-14 w-full rounded-2xl" />
            <Skeleton className="mt-4 h-24 w-full rounded-3xl" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,1fr)]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-3 h-8 w-64" />
            <Skeleton className="mt-3 h-4 w-3/4" />
            <div className="mt-6 flex gap-3 overflow-hidden">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton className="h-24 w-44 rounded-3xl" key={`journey-day-skeleton-${index + 1}`} />
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-8 w-56" />
            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4" key={`journey-category-skeleton-${index + 1}`}>
                  <Skeleton className="h-11 w-11 rounded-2xl bg-white" />
                  <Skeleton className="mt-4 h-5 w-20" />
                  <Skeleton className="mt-2 h-4 w-full" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-3 h-8 w-40" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="rounded-3xl border border-slate-200 bg-white p-4" key={`journey-place-input-skeleton-${index + 1}`}>
                  <Skeleton className="h-16 w-full rounded-2xl" />
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <Skeleton className="h-12 w-full rounded-2xl" />
                    <Skeleton className="h-12 w-full rounded-2xl" />
                    <Skeleton className="h-12 w-full rounded-2xl md:col-span-2" />
                    <Skeleton className="h-12 w-full rounded-2xl" />
                    <Skeleton className="h-12 w-full rounded-2xl" />
                    <Skeleton className="h-28 w-full rounded-3xl md:col-span-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-8 w-48" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-5 h-[420px] w-full rounded-[24px]" />
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <Skeleton className="h-4 w-24" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
            <Skeleton className="mt-5 h-12 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
