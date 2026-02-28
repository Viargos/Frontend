type DashboardPostCardSkeletonProps = {
  variant?: 'media' | 'text';
};

function ActionRowSkeleton() {
  return (
    <div className="flex items-center gap-1 border-t border-gray-50 px-3 py-2">
      <div className="h-9 w-20 animate-pulse rounded-xl bg-gray-200" />
      <div className="h-9 w-20 animate-pulse rounded-xl bg-gray-200" />
    </div>
  );
}

function MediaCardSkeleton() {
  return (
    <>
      <div className="relative">
        <div className="aspect-square animate-pulse bg-gray-200" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute top-3 right-3 z-20 h-8 w-32 animate-pulse rounded-xl bg-black/25" />
        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2">
          <div className="h-8 w-8 animate-pulse rounded-full bg-white/70" />
          <div className="h-4 w-24 animate-pulse rounded bg-white/70" />
        </div>
      </div>

      <div className="px-4 pt-3 pb-1">
        <div className="mb-2 flex items-center justify-between">
          <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-14 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-[88%] animate-pulse rounded bg-gray-200" />
        </div>
      </div>

      <ActionRowSkeleton />
    </>
  );
}

function TextCardSkeleton() {
  return (
    <>
      <div className="flex">
        <div className="w-1 flex-shrink-0 rounded-l-2xl bg-gradient-to-b from-[#160E53] to-indigo-300" />
        <div className="min-w-0 flex-1 px-4 pt-4 pb-2">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex w-[178px] min-w-0 items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
              <div className="min-w-0 space-y-1.5">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
            <div className="h-8 w-32 animate-pulse rounded-xl bg-gray-200" />
          </div>

          <div className="mb-2.5 h-3.5 w-32 animate-pulse rounded bg-gray-200" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-[90%] animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>

      <ActionRowSkeleton />
    </>
  );
}

export function DashboardPostCardSkeleton(props: DashboardPostCardSkeletonProps) {
  const { variant = 'media' } = props;

  return (
    <article
      aria-hidden="true"
      className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
    >
      {variant === 'media' ? <MediaCardSkeleton /> : <TextCardSkeleton />}
    </article>
  );
}
