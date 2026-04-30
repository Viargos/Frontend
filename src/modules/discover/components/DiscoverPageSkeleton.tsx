import { Skeleton } from '@/modules/common';

export function DiscoverPageSkeleton() {
  return (
    <div aria-busy="true" className="w-full bg-gray-50" role="status">
      <main className="flex h-[calc(100vh-80px)] overflow-hidden">
        <div className="relative min-w-0 flex-1 overflow-hidden bg-gray-100">
          <Skeleton className="h-full w-full rounded-none bg-gray-200" />
          <div className="pointer-events-none absolute top-4 left-4 space-y-2">
            <Skeleton className="h-10 w-10 rounded-full bg-white/80" />
            <Skeleton className="h-10 w-10 rounded-full bg-white/80" />
            <Skeleton className="h-10 w-10 rounded-full bg-white/80" />
          </div>
        </div>

        <aside className="hidden h-[calc(100vh-80px)] w-96 flex-col border-l border-gray-200 bg-white shadow-2xl lg:flex">
          <div className="border-b border-gray-200 p-6">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="mt-2 h-4 w-36" />
            <div className="mt-4 flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton className="h-9 w-14 rounded-lg" key={`discover-skeleton-radius-${index + 1}`} />
              ))}
            </div>
          </div>
          <div className="space-y-3 overflow-y-auto p-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div className="rounded-xl border border-gray-200 bg-white p-4" key={`discover-skeleton-card-${index + 1}`}>
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="mt-2 h-4 w-1/2" />
                <Skeleton className="mt-3 h-4 w-1/3" />
                <Skeleton className="mt-4 h-9 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}
