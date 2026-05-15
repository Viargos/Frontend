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
      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] shadow-[0_24px_60px_-36px_rgba(0,0,0,0.9)] ring-1 ring-white/5 backdrop-blur-xl">
        <div className="border-b border-white/10 px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">Route snapshot</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-100">Journey map</h2>
              <p className="mt-1 text-sm text-slate-400">A quick overview of all planned locations in this itinerary.</p>
            </div>
            <Badge className="border-white/10 bg-white/[0.06] text-slate-200" variant="muted">
              {places.length}
              {' '}
              stops
            </Badge>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.9)_0%,rgba(30,41,59,0.72)_100%)] p-4">
            <MapRouteIllustration className="h-auto w-full" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Mapped</p>
                <p className="mt-1 text-lg font-semibold text-slate-100">{plottedPlaces.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Total places</p>
                <p className="mt-1 text-lg font-semibold text-slate-100">{places.length}</p>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold tracking-[0.18em] text-slate-300 uppercase">Locations</h3>
              <span className="text-xs text-slate-500">
                {places.length > 0 ? 'Ordered by itinerary' : 'No stops yet'}
              </span>
            </div>

            <div className="space-y-2">
              {places.length > 0
                ? places.map((place, index) => (
                    <div key={place.id} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f8d775]/12 text-[#f8d775] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                        <MapPinIcon size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-slate-100">{place.name}</p>
                          <span className="text-xs text-slate-500">
                            #
                            {index + 1}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          {place.address || 'Address not added yet'}
                        </p>
                      </div>
                    </div>
                  ))
                : (
                    <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.04] p-6 text-center">
                      <p className="text-sm font-medium text-slate-200">No locations available yet</p>
                      <p className="mt-1 text-sm text-slate-400">Add places to see a stronger route snapshot here.</p>
                    </div>
                  )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
