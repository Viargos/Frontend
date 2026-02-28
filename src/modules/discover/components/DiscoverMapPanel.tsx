import type { DiscoverCoordinates, DiscoverJourney } from '@/modules/discover/types/discover.types';
import * as motion from 'framer-motion/client';
import { toMapPins } from '@/modules/discover/helpers/discover.helper';

type DiscoverMapPanelProps = {
  coordinates: DiscoverCoordinates | null;
  journeys: DiscoverJourney[];
};

export const DiscoverMapPanel = (props: DiscoverMapPanelProps) => {
  const { coordinates, journeys } = props;
  const pins = toMapPins(journeys).filter(pin => pin.latitude !== undefined && pin.longitude !== undefined);

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
      initial={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.3 }}
    >
      <div className="border-b border-gray-100 bg-gradient-to-r from-[#160E53]/5 to-transparent px-4 py-4">
        <h2 className="text-sm font-semibold text-[#160E53]">Map View</h2>
        <p className="mt-1 text-xs text-gray-600">
          {coordinates ? `Center: ${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}` : 'Waiting for location...'}
        </p>
      </div>

      <div className="space-y-3 p-4">
        <div className="relative min-h-64 overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-[#160E53]/5 via-white to-[#0891b2]/10 p-3">
          <div className="absolute inset-0 [background-image:radial-gradient(#160E53_1px,transparent_1px)] [background-size:18px_18px] opacity-30" />
          <div className="relative">
            <p className="mb-2 text-xs font-medium text-gray-600">
              Map markers:
              {' '}
              <span className="text-[#160E53]">{pins.length}</span>
            </p>

            <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg bg-white/90 p-2">
              {pins.map(pin => (
                <div
                  key={`${pin.journeyId}-${pin.id}`}
                  className="rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700"
                >
                  {pin.name}
                  {' '}
                  <span className="text-gray-500">
                    (
                    {pin.journeyTitle}
                    )
                  </span>
                </div>
              ))}
              {pins.length === 0 ? <p className="px-1 py-2 text-xs text-gray-500">No mappable places available.</p> : null}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
