import { DashboardPostCardSkeleton } from './DashboardPostCardSkeleton';

type DashboardFeedSkeletonProps = {
  embedded?: boolean;
  items?: number;
};

export function DashboardFeedSkeleton(props: DashboardFeedSkeletonProps) {
  const { embedded = false, items = 6 } = props;
  const skeletonCards: Array<{ id: string; variant: 'media' | 'text' }> = Array.from({ length: items }, (_, index) => ({
    id: `dashboard-skeleton-card-${index}`,
    variant: index % 3 === 1 ? 'text' : 'media',
  }));

  const content = (
    <div aria-busy="true" aria-live="polite" className="w-full" role="status">
      <div className="mx-auto max-w-[680px] space-y-5">
        {skeletonCards.map(item => (
          <DashboardPostCardSkeleton
            key={item.id}
            variant={item.variant}
          />
        ))}
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="min-h-[calc(100vh-200px)] w-full flex-1 p-4 sm:p-6">
      {content}
    </div>
  );
}
