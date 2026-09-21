'use client';

import type { FormEvent } from 'react';
import type {
  DashboardJourneyRecommendation,
} from '@/modules/dashboard/types/dashboard.types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { JourneyIcon, SearchIcon } from './dashboard-icons';
import { JourneyItem } from './JourneyItem';
import { RightPanelContainer } from './RightPanelContainer';
import { SectionHeader } from './SectionHeader';

type DashboardRecommendationsPanelProps = {
  initialJourneys: DashboardJourneyRecommendation[];
};

const LIVE_TRAVEL_ITEMS = [
  {
    href: '/discover?location=Kashmir',
    meta: 'Hosted by Priyanshi',
    title: 'Kashmir photo walk is active now',
  },
  {
    href: '/discover?location=Kerala',
    meta: '5 planners joined today',
    title: 'Kerala backwater route',
  },
];

const TRAVEL_PULSE_ITEMS = [
  {
    href: '/discover?location=Monsoon%20stays',
    meta: 'Trending in journeys',
    title: 'Monsoon stays people are saving this week',
  },
  {
    href: '/discover?location=Goa',
    meta: 'Popular near explorers',
    title: 'Goa food trails with short-hop itineraries',
  },
  {
    href: '/discover?location=Iceland',
    meta: 'Rising search',
    title: 'Iceland road trip ideas for first timers',
  },
];

const RightRailSearch = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextQuery = query.trim();
    if (!nextQuery) {
      return;
    }

    router.push(`/discover?location=${encodeURIComponent(nextQuery)}`);
  };

  return (
    <form className="relative" role="search" onSubmit={handleSubmit}>
      <SearchIcon className="dashboard-right-search-icon pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
      <input
        aria-label="Search journeys"
        className="dashboard-right-search-input h-11 w-full rounded-full border pr-4 pl-11 text-sm transition-all outline-none"
        placeholder="Search"
        type="search"
        value={query}
        onChange={event => setQuery(event.target.value)}
      />
    </form>
  );
};

const RightRailLiveWidget = () => (
  <section className="dashboard-right-section rounded-2xl border px-4 py-4">
    <SectionHeader title="Live on Viargos" />

    <div className="mt-3 space-y-3">
      {LIVE_TRAVEL_ITEMS.map(item => (
        <Link className="dashboard-recommendation-item block w-full rounded-xl px-3 py-2 text-left transition-colors" href={item.href} key={item.title}>
          <p className="dashboard-recommendation-title text-sm font-semibold">{item.title}</p>
          <p className="dashboard-recommendation-muted mt-1 text-[11px] font-medium">{item.meta}</p>
        </Link>
      ))}
    </div>
  </section>
);

const RightRailPulseWidget = () => (
  <section className="dashboard-right-section rounded-2xl border px-4 py-4">
    <SectionHeader title="Today's Travel Pulse" />

    <div className="mt-2 divide-y divide-gray-100">
      {TRAVEL_PULSE_ITEMS.map(item => (
        <Link className="block w-full px-3 py-3 text-left transition-colors hover:bg-gray-50" href={item.href} key={item.title}>
          <p className="dashboard-recommendation-muted text-[11px] font-medium">{item.meta}</p>
          <p className="dashboard-recommendation-title mt-1 line-clamp-2 text-sm leading-5 font-semibold">{item.title}</p>
        </Link>
      ))}
    </div>
  </section>
);

export const DashboardRecommendationsPanel = (props: DashboardRecommendationsPanelProps) => {
  const { initialJourneys } = props;

  return (
    <div className="space-y-4">
      <RightPanelContainer>
        <RightRailSearch />

        {initialJourneys.length > 0
          ? (
              <section className="dashboard-right-section rounded-2xl border px-4 py-4">
                <SectionHeader
                  description="High-signal itineraries people are opening right now."
                  icon={<JourneyIcon className="h-4 w-4" />}
                  title="Popular journeys"
                />

                <div className="mt-3 space-y-1">
                  {initialJourneys.map(journey => (
                    <JourneyItem key={journey.id} journey={journey} />
                  ))}
                </div>
              </section>
            )
          : null}

        <RightRailLiveWidget />
        <RightRailPulseWidget />
      </RightPanelContainer>
    </div>
  );
};
