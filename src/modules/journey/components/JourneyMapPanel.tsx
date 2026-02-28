import type { JourneyPlace } from '@/modules/journey/types/journey-detail.types';

type JourneyMapPanelProps = {
  places: JourneyPlace[];
};

export const JourneyMapPanel = (props: JourneyMapPanelProps) => {
  const { places } = props;

  return (
    <div className="order-first mb-4 overflow-hidden rounded-xl shadow-sm lg:sticky lg:top-6 lg:order-last lg:col-span-1 lg:mb-0 lg:self-start">
      <div className="relative h-[280px] overflow-hidden rounded-xl bg-white sm:h-[320px] md:h-[380px] lg:h-[calc(100vh-8rem)] lg:min-h-[460px]">
        <div className="absolute inset-0">
          <div className="h-full w-full bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200">
            <div className="flex h-full w-full items-center justify-center">
              <div className="w-full max-w-xs space-y-2 rounded-lg border border-slate-200 bg-white/90 p-3 text-center shadow-sm backdrop-blur-sm">
                <p className="text-xs font-semibold tracking-wide text-[#160E53] uppercase">Journey Map</p>
                <p className="text-xs text-slate-600">
                  {places.length}
                  {' '}
                  locations plotted
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0">
          <div className="pointer-events-auto absolute top-3 right-3 z-10">
            <div className="flex flex-col overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm">
              <button className="h-8 w-8 border-b border-slate-200 text-sm text-slate-600" type="button">+</button>
              <button className="h-8 w-8 text-sm text-slate-600" type="button">-</button>
            </div>
          </div>

          <div className="pointer-events-auto absolute right-3 bottom-3 left-3 z-10">
            <div className="max-h-28 overflow-y-auto rounded-md border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur-sm">
              <div className="space-y-1.5">
                {places.length > 0
                  ? places.map(place => (
                      <div key={place.id} className="rounded border border-slate-200 bg-slate-50 px-2 py-1.5">
                        <p className="truncate text-xs font-medium text-slate-800">{place.name}</p>
                        {place.address ? <p className="line-clamp-1 text-[11px] text-slate-500">{place.address}</p> : null}
                      </div>
                    ))
                  : <p className="text-center text-xs text-slate-500">No locations available.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
