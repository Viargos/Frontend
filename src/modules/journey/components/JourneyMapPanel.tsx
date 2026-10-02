import type { JourneyPlace } from '@/modules/journey/types/journey-detail.types';
import { MapRouteIllustration } from '@/modules/common';

type JourneyMapPanelProps = {
  places: JourneyPlace[];
};

export const JourneyMapPanel = (_props: JourneyMapPanelProps) => {
  return (
    <aside className="order-first mb-6 lg:sticky lg:top-6 lg:order-last lg:mb-0 lg:self-start">
      <MapRouteIllustration className="h-auto w-full" />
    </aside>
  );
};
