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
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.22em] text-slate-400 uppercase">Route snapshot</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">Journey map</h2>
              <p className="mt-1 text-sm text-slate-500">A quick overview of all planned locations in this itinerary.</p>
            </div>
            <Badge className="border-slate-200 bg-slate-100 text-slate-700" variant="muted">
              {places.length}
              {' '}
              stops
            </Badge>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="rounded-[24px] border border-slate-200 bg-linear-to-br from-slate-50 via-white to-slate-100 p-4">
            <MapRouteIllustration className="h-auto w-full" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">Mapped</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{plottedPlaces.length}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">Total places</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{places.length}</p>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold tracking-[0.18em] text-slate-700 uppercase">Locations</h3>
              <span className="text-xs text-slate-400">
                {places.length > 0 ? 'Ordered by itinerary' : 'No stops yet'}
              </span>
            </div>

            <div className="space-y-2">
              {places.length > 0
                ? places.map((place, index) => (
                    <div key={place.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#160E53] shadow-sm">
                        <MapPinIcon size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-slate-900">{place.name}</p>
                          <span className="text-xs text-slate-400">
                            #
                            {index + 1}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {place.address || 'Address not added yet'}
                        </p>
                      </div>
                    </div>
                  ))
                : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                      <p className="text-sm font-medium text-slate-700">No locations available yet</p>
                      <p className="mt-1 text-sm text-slate-500">Add places to see a stronger route snapshot here.</p>
                    </div>
                  )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
