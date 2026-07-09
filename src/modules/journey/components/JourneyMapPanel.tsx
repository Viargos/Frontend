import type { JourneyPlace } from '@/modules/journey/types/journey-detail.types';
import { Badge, MapPinIcon, MapRouteIllustration } from '@/modules/common';

type JourneyMapPanelProps = {
  places: JourneyPlace[];
};

export const JourneyMapPanel = (props: JourneyMapPanelProps) => {
  const { places } = props;
  const plottedPlaces = places.filter(place => place.latitude != null && place.longitude != null);

  return (
    <aside className="order-first mb-6 lg:sticky lg:top-6 lg:order-last lg:mb-0 lg:self-start">
      <div className="journey-planner-card overflow-hidden rounded-[28px] border">
        <div className="border-b px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="journey-planner-label text-xs font-semibold tracking-[0.22em] uppercase">Route snapshot</p>
              <h2 className="journey-planner-title mt-1 text-xl font-semibold tracking-tight">Journey map</h2>
              <p className="journey-planner-copy mt-1 text-sm">A quick overview of all planned locations in this itinerary.</p>
            </div>
            <Badge variant="muted">
              {places.length}
              {' '}
              stops
            </Badge>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="journey-planner-subcard rounded-[24px] border p-4">
            <MapRouteIllustration className="h-auto w-full" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="journey-planner-card rounded-2xl border p-3">
                <p className="journey-planner-label text-xs font-medium tracking-wide uppercase">Mapped</p>
                <p className="journey-planner-title mt-1 text-lg font-semibold">{plottedPlaces.length}</p>
              </div>
              <div className="journey-planner-card rounded-2xl border p-3">
                <p className="journey-planner-label text-xs font-medium tracking-wide uppercase">Total places</p>
                <p className="journey-planner-title mt-1 text-lg font-semibold">{places.length}</p>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="journey-planner-title text-sm font-semibold tracking-[0.18em] uppercase">Locations</h3>
              <span className="journey-planner-muted text-xs">
                {places.length > 0 ? 'Ordered by itinerary' : 'No stops yet'}
              </span>
            </div>

            <div className="space-y-2">
              {places.length > 0
                ? places.map((place, index) => (
                    <div key={place.id} className="journey-planner-subcard flex items-start gap-3 rounded-2xl border px-3 py-3">
                      <div className="journey-planner-icon-tile flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                        <MapPinIcon size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="journey-planner-title truncate text-sm font-semibold">{place.name}</p>
                          <span className="journey-planner-muted text-xs">
                            #
                            {index + 1}
                          </span>
                        </div>
                        <p className="journey-planner-copy mt-1 text-xs">
                          {place.address || 'Address not added yet'}
                        </p>
                      </div>
                    </div>
                  ))
                : (
                    <div className="journey-planner-empty-state rounded-2xl border border-dashed p-6 text-center">
                      <p className="journey-planner-title text-sm font-medium">No locations available yet</p>
                      <p className="journey-planner-copy mt-1 text-sm">Add places to see a stronger route snapshot here.</p>
                    </div>
                  )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
