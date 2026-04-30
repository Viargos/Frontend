import type { JourneyMedia, JourneyPlace } from '@/modules/journey/types/journey-detail.types';
import { Badge } from '@/modules/common';
import { PlaceCard } from '@/modules/journey/components/PlaceCard';

type PlaceGroupProps = {
  places: JourneyPlace[];
  title: string;
  onOpenMedia: (media: JourneyMedia[], index: number) => void;
};

export const PlaceGroup = (props: PlaceGroupProps) => {
  const {
    places,
    title,
    onOpenMedia,
  } = props;

  if (places.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-semibold tracking-[0.18em] text-slate-700 uppercase">{title}</h3>
        <Badge className="border-slate-200 bg-slate-100 text-slate-600" variant="muted">
          {places.length}
        </Badge>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="space-y-4 sm:space-y-6">
        {places.map(place => <PlaceCard key={place.id} place={place} onOpenMedia={onOpenMedia} />)}
      </div>
    </section>
  );
};
