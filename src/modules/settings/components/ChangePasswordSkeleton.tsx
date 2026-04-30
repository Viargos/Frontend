import { Skeleton } from '@/modules/common';

export function ChangePasswordSkeleton() {
  return (
    <div aria-busy="true" className="min-h-screen bg-gray-50" role="status">
      <div className="mx-auto max-w-2xl">
        <div className="border-b border-gray-200 bg-white px-4 py-4">
          <Skeleton className="h-7 w-48" />
        </div>

        <div className="mx-auto max-w-2xl bg-white">
          <div className="space-y-4 p-4">
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
            <div className="space-y-3 pt-2">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-40 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
