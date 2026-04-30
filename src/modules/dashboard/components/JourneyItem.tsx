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
    <div className="dashboard-recommendation-avatar flex h-12 w-12 items-center justify-center rounded-2xl bg-[#160E53]/8 text-sm font-semibold text-[#160E53]">
      {title.charAt(0).toUpperCase()}
    </div>
  );
}

export const JourneyItem = (props: JourneyItemProps) => {
  const { journey } = props;

  return (
    <Link
      className="dashboard-recommendation-item group flex items-start gap-3 rounded-2xl px-3 py-3 transition-colors duration-200 hover:bg-gray-50/90"
      href={`/journey/${journey.id}`}
    >
      <JourneyCover coverImage={journey.coverImage} title={journey.title} />

      <div className="min-w-0 flex-1">
        <p className="dashboard-recommendation-title truncate text-sm font-semibold text-gray-950 transition-colors group-hover:text-[#160E53]">
          {journey.title}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          by
          {' '}
          {journey.creator.username}
        </p>
        <p className="mt-1 text-[11px] font-medium text-gray-400">
          {formatJourneyMeta(journey)}
        </p>
      </div>
    </Link>
  );
};
