import { Skeleton } from '@/modules/common';

export function PlanYourJourneySkeleton() {
  return (
    <div aria-busy="true" className="relative flex h-full min-h-screen flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4 sm:p-6" role="status">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[12%] left-[8%]">
          <Skeleton className="h-28 w-40 rounded-xl bg-white/70" />
        </div>
        <div className="absolute right-[10%] bottom-[15%]">
          <Skeleton className="h-24 w-36 rounded-xl bg-white/70" />
        </div>
        <div className="absolute top-[55%] left-[20%]">
          <Skeleton className="h-32 w-44 rounded-xl bg-white/70" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-white/70 bg-white/70 p-8 shadow-xl backdrop-blur-sm">
        <div className="space-y-4 text-center">
          <Skeleton className="mx-auto h-10 w-2/3" />
          <Skeleton className="mx-auto h-4 w-5/6" />
          <Skeleton className="mx-auto h-4 w-3/4" />
          <div className="pt-4">
            <Skeleton className="mx-auto h-10 w-44 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
