import { Skeleton } from '@/modules/common';

function SettingsSectionSkeleton(props: { itemCount: number; withToggles?: boolean }) {
  return (
    <div className="divide-y divide-[var(--border-subtle)] border-b border-[var(--border-subtle)]">
      {Array.from({ length: props.itemCount }).map((_, index) => (
        <div className="flex items-center justify-between gap-5 px-6 py-6" key={`settings-item-skeleton-${index + 1}`}>
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <Skeleton className="size-5 shrink-0 rounded bg-[var(--surface-2)]" />
            <div className="min-w-0 flex-1 space-y-2.5">
              <Skeleton className="h-3.5 w-36 max-w-full bg-[var(--surface-2)]" />
              <Skeleton className="h-3 w-64 max-w-full bg-[var(--surface-2)]" />
            </div>
          </div>
          {props.withToggles
            ? <Skeleton className="h-6 w-11 shrink-0 rounded-full bg-[var(--surface-2)]" />
            : <Skeleton className="size-4 shrink-0 bg-[var(--surface-2)]" />}
        </div>
      ))}
    </div>
  );
}

export function SettingsPageSkeleton() {
  return (
    <div aria-busy="true" className="flex h-[calc(100dvh-5rem)] min-h-0 overflow-hidden bg-[var(--surface-0)] sm:h-dvh motion-reduce:[&_*]:animate-none" role="status">
      <div className="flex min-h-0 w-full shrink-0 flex-col border-r border-[var(--border-subtle)] md:w-80 xl:w-[400px]">
        <div className="flex h-16 shrink-0 items-center px-5">
          <Skeleton className="h-6 w-28 bg-[var(--surface-2)]" />
        </div>
        <div className="shrink-0 px-4 pb-4">
          <Skeleton className="h-11 w-full rounded-full bg-[var(--surface-2)]" />
        </div>
        <div className="min-h-0 flex-1 overflow-hidden pb-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="flex min-h-14 items-center justify-between gap-3 px-5 py-4" key={`settings-category-skeleton-${index + 1}`}>
              <Skeleton className="h-3.5 w-40 max-w-full bg-[var(--surface-2)]" />
              <Skeleton className="size-4 shrink-0 bg-[var(--surface-2)]" />
            </div>
          ))}
        </div>
      </div>
      <div className="hidden min-h-0 min-w-0 flex-1 flex-col md:flex">
        <div className="flex h-16 shrink-0 items-center border-b border-[var(--border-subtle)] px-5">
          <Skeleton className="h-5 w-40 bg-[var(--surface-2)]" />
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="space-y-3 px-6 py-6">
            <Skeleton className="h-3 w-80 max-w-full bg-[var(--surface-2)]" />
            <Skeleton className="h-3 w-56 max-w-full bg-[var(--surface-2)]" />
          </div>
          <SettingsSectionSkeleton itemCount={3} />
          <SettingsSectionSkeleton itemCount={1} withToggles />
        </div>
      </div>
    </div>
  );
}
