'use client';

import type {
  DashboardJourneyRecommendation,
} from '@/modules/dashboard/types/dashboard.types';
import { JourneyIcon } from './dashboard-icons';
import { JourneyItem } from './JourneyItem';
import { RightPanelContainer } from './RightPanelContainer';
import { SectionHeader } from './SectionHeader';

type DashboardRecommendationsPanelProps = {
  initialJourneys: DashboardJourneyRecommendation[];
};

export const DashboardRecommendationsPanel = (props: DashboardRecommendationsPanelProps) => {
  const { initialJourneys } = props;

  return (
    <div className="space-y-4">
      {initialJourneys.length > 0
        ? (
            <RightPanelContainer contentClassName="xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto">
              <section className="dashboard-right-section rounded-[24px] border px-2 py-3">
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
            </RightPanelContainer>
          )
        : null}
    </div>
  );
};
