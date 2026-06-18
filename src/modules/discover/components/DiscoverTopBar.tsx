'use client';

import type { JourneyFilterState } from '@/modules/discover/components/FilterPanel';
import type { DiscoverCoordinates } from '@/modules/discover/types/discover.types';
import { ExploreIcon, MapPinIcon, SearchIcon } from '@/modules/common/icons';
import { DiscoverFilterChips } from '@/modules/discover/components/DiscoverFilterChips';
import { DISCOVER_DEFAULT_RADIUS_KM } from '@/modules/discover/constants/discover.constants';

type DiscoverTopBarProps = {
  coordinates: DiscoverCoordinates | null;
  filters: JourneyFilterState;
  isFilterPanelOpen: boolean;
  query: string;
  resultCount: number;
  onClearDateRange: () => void;
  onClearQuery: () => void;
  onQueryChange: (value: string) => void;
  onResetRadius: () => void;
  onResetTimeFilter: () => void;
  onToggleFilters: () => void;
};

function getTimeChipLabel(createdWithin: JourneyFilterState['createdWithin']) {
  if (createdWithin === 'week') {
    return 'Past week';
  }

  if (createdWithin === 'month') {
    return 'Past month';
  }

  if (createdWithin === 'year') {
    return 'Past year';
  }

  return null;
}

export const DiscoverTopBar = (props: DiscoverTopBarProps) => {
  const {
    coordinates,
    filters,
    isFilterPanelOpen,
    onClearDateRange,
    onClearQuery,
    onQueryChange,
    onResetRadius,
    onResetTimeFilter,
    onToggleFilters,
    query,
    resultCount,
  } = props;
  const timeChipLabel = getTimeChipLabel(filters.createdWithin);
  const hasDateRange = Boolean(filters.dateRange.from || filters.dateRange.to);
  const chips = [
    ...(query.trim()
      ? [{ id: 'query', label: `Search: ${query.trim()}`, onRemove: onClearQuery }]
      : []),
    ...(timeChipLabel
      ? [{ id: 'time', label: timeChipLabel, onRemove: onResetTimeFilter }]
      : []),
    ...(hasDateRange
      ? [{
          id: 'date-range',
          label: `${filters.dateRange.from || 'Any start'} - ${filters.dateRange.to || 'Any end'}`,
          onRemove: onClearDateRange,
        }]
      : []),
    ...(filters.radius !== DISCOVER_DEFAULT_RADIUS_KM
      ? [{ id: 'radius', label: `${filters.radius} km`, onRemove: onResetRadius }]
      : []),
  ];

  return (
    <div className="border-b border-black/5 bg-white/88 px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-[#160E53]/65 uppercase">
            <ExploreIcon className="h-3.5 w-3.5" />
            Discover
          </div>
          <div className="mt-1 flex flex-wrap items-end gap-x-3 gap-y-1">
            <h1 className="text-2xl font-semibold tracking-[-0.02em] text-gray-950">
              Explore the world through real journeys
            </h1>
            <p className="text-sm text-gray-500">
              {resultCount}
              {' '}
              results
              {coordinates ? ' near you' : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:min-w-[420px]">
          <label className="relative block">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              className="h-12 w-full rounded-full border border-black/5 bg-white pr-4 pl-11 text-sm text-gray-900 shadow-[0_8px_28px_rgba(15,23,42,0.06)] transition outline-none focus:border-[#160E53]/20 focus:ring-4 focus:ring-[#160E53]/8"
              placeholder="Search places, journeys, creators, or tags"
              type="search"
              value={query}
              onChange={event => onQueryChange(event.target.value)}
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <button
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isFilterPanelOpen
                  ? 'bg-[#160E53] text-white'
                  : 'bg-white text-gray-700 ring-1 ring-black/5 hover:bg-gray-50'
              }`}
              type="button"
              onClick={onToggleFilters}
            >
              <ExploreIcon className="h-4 w-4" />
              Filters
            </button>

            {coordinates
              ? (
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#160E53]/6 px-3 py-2 text-xs font-medium text-[#160E53]">
                    <MapPinIcon className="h-3.5 w-3.5" />
                    <span>
                      {coordinates.latitude.toFixed(2)}
                      ,
                      {' '}
                      {coordinates.longitude.toFixed(2)}
                    </span>
                  </div>
                )
              : null}
          </div>
        </div>
      </div>

      <DiscoverFilterChips chips={chips} />
    </div>
  );
};
