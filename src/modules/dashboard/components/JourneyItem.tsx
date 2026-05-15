'use client';

import type { DashboardJourneyRecommendation } from '@/modules/dashboard/types/dashboard.types';
import Image from 'next/image';
import Link from 'next/link';

type JourneyItemProps = {
  journey: DashboardJourneyRecommendation;
};

function formatJourneyMeta(journey: DashboardJourneyRecommendation): string {
  return `${journey.placesCount} places • ${journey.daysCount} day${journey.daysCount === 1 ? '' : 's'}`;
}

function JourneyCover(props: Pick<DashboardJourneyRecommendation, 'coverImage' | 'title'>) {
  const { coverImage, title } = props;

  if (coverImage) {
    return (
      <Image
        alt={title}
        className="h-12 w-12 rounded-2xl object-cover"
        height={48}
        src={coverImage}
        unoptimized
        width={48}
      />
    );
  }

  return (
    <div className="dashboard-recommendation-avatar flex h-12 w-12 items-center justify-center rounded-2xl border bg-[#160E53]/8 text-sm font-semibold text-[#160E53]">
      {title.charAt(0).toUpperCase()}
    </div>
  );
}

export const JourneyItem = (props: JourneyItemProps) => {
  const { journey } = props;

  return (
    <Link
      className="dashboard-recommendation-item group flex items-start gap-3 rounded-2xl border border-transparent px-3 py-3 transition-all duration-200 hover:border-white/8 hover:bg-white/[0.04]"
      href={`/journey/${journey.id}`}
    >
      <JourneyCover coverImage={journey.coverImage} title={journey.title} />

      <div className="min-w-0 flex-1">
        <p className="dashboard-recommendation-title truncate text-sm font-semibold text-slate-100 transition-colors group-hover:text-[#f8d775]">
          {journey.title}
        </p>
        <p className="dashboard-recommendation-description mt-1 text-xs">
          by
          {' '}
          {journey.creator.username}
        </p>
        <p className="dashboard-recommendation-muted mt-1 text-[11px] font-medium">
          {formatJourneyMeta(journey)}
        </p>
      </div>
    </Link>
  );
};
