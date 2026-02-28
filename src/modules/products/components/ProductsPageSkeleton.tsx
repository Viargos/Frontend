import { Skeleton } from '@/modules/common';

export function ProductsPageSkeleton() {
  return (
    <div aria-busy="true" className="space-y-6 p-4 sm:p-6" role="status">
      <section className="rounded-md border border-gray-200 bg-white p-4 sm:p-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-2 h-4 w-80" />
      </section>

      <section className="rounded-md border border-gray-200 bg-white p-4 sm:p-6">
        <Skeleton className="mb-4 h-6 w-36" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-36 rounded-md" />
        </div>
      </section>

      <section className="rounded-md border border-gray-200 bg-white p-4 sm:p-6">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="grid grid-cols-4 gap-3" key={`product-row-skeleton-${index + 1}`}>
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
