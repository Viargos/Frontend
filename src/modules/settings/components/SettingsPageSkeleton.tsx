import { Skeleton } from '@/modules/common';

function SettingsSectionSkeleton(props: { itemCount: number; withToggles?: boolean }) {
  const { itemCount, withToggles = false } = props;

  return (
    <section className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
      <Skeleton className="h-5 w-40" />
      {Array.from({ length: itemCount }).map((_, index) => (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 p-3" key={`settings-item-skeleton-${index + 1}`}>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div className="min-w-0 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>
          {withToggles ? <Skeleton className="h-6 w-11 rounded-full" /> : <Skeleton className="h-4 w-10" />}
        </div>
      ))}
    </section>
  );
}

export function SettingsPageSkeleton() {
  return (
    <div aria-busy="true" className="min-h-screen bg-gray-50" role="status">
      <div className="mx-auto max-w-2xl">
        <div className="border-b border-gray-200 bg-white px-4 py-4">
          <Skeleton className="h-7 w-32" />
        </div>

        <div className="space-y-6 py-4">
          <SettingsSectionSkeleton itemCount={4} />
          <SettingsSectionSkeleton itemCount={3} withToggles />
          <SettingsSectionSkeleton itemCount={5} withToggles />
          <SettingsSectionSkeleton itemCount={2} />
          <SettingsSectionSkeleton itemCount={2} />
          <SettingsSectionSkeleton itemCount={2} />
        </div>
      </div>
    </div>
  );
}
