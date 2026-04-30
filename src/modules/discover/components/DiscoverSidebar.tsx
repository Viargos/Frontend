'use client';

import type { JourneyFilterState } from '@/modules/discover/components/FilterPanel';
import type { DiscoverFeedItem } from '@/modules/discover/types/discover-ui.types';
import type { DiscoverCoordinates, DiscoverJourney } from '@/modules/discover/types/discover.types';
import { ExploreIcon, MapPinIcon, RefreshCwIcon, SearchIcon, XIcon } from '@/modules/common/icons';
import { DiscoverFeed } from '@/modules/discover/components/DiscoverFeed';
import { DiscoverFilterChips } from '@/modules/discover/components/DiscoverFilterChips';
import { FilterPanel } from '@/modules/discover/components/FilterPanel';
import { useDiscoverStore } from '@/modules/discover/store/discover.store';

type DiscoverSidebarProps = {
  coordinates: DiscoverCoordinates | null;
  currentRadius: number;
  disableMotion?: boolean;
  feedItems: DiscoverFeedItem[];
  filters: JourneyFilterState;
  isLoadingJourneys: boolean;
  isSidebarOpen: boolean;
  journeys: DiscoverJourney[];
  onCloseSidebar: () => void;
  onClearDateRange: () => void;
  onClearQuery: () => void;
  onFiltersChange: (filters: JourneyFilterState) => void;
  onJourneySelect: (journey: DiscoverJourney) => void;
  onQueryChange: (value: string) => void;
  onResetRadius: () => void;
  onRadiusChange: (radius: number) => void;
  onResetFilters: () => void;
  onResetTimeFilter: () => void;
  onToggleFilters: () => void;
  resultCount: number;
  searchQuery: string;
  selectedJourney: DiscoverJourney | null;
  showFilters: boolean;
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

export const DiscoverSidebar = (props: DiscoverSidebarProps) => {
  const {
    coordinates,
    currentRadius,
    disableMotion = false,
    feedItems,
    filters,
    isLoadingJourneys,
    isSidebarOpen,
    journeys,
    onCloseSidebar,
    onClearDateRange,
    onClearQuery,
    onFiltersChange,
    onJourneySelect,
    onQueryChange,
    onResetRadius,
    onRadiusChange,
    onResetFilters,
    onResetTimeFilter,
    onToggleFilters,
    resultCount,
    searchQuery,
    selectedJourney,
    showFilters,
  } = props;
  const hoveredItemId = useDiscoverStore(state => state.hoveredItemId);
  const selectedItemId = useDiscoverStore(state => state.selectedItemId);
  const setHoveredItemId = useDiscoverStore(state => state.setHoveredItemId);
  const setSelectedItemId = useDiscoverStore(state => state.setSelectedItemId);
  const timeChipLabel = getTimeChipLabel(filters.createdWithin);
  const chips = [
    ...(searchQuery.trim()
      ? [{ id: 'query', label: `Search: ${searchQuery.trim()}`, onRemove: onClearQuery }]
      : []),
    ...(timeChipLabel
      ? [{ id: 'time', label: timeChipLabel, onRemove: onResetTimeFilter }]
      : []),
    ...(filters.dateRange.from || filters.dateRange.to
      ? [{
          id: 'date-range',
          label: `${filters.dateRange.from || 'Any start'} - ${filters.dateRange.to || 'Any end'}`,
          onRemove: onClearDateRange,
        }]
      : []),
    ...(filters.radius !== 500
      ? [{ id: 'radius', label: `${filters.radius} km`, onRemove: onResetRadius }]
      : []),
  ];

  if (!isSidebarOpen) {
    return null;
  }

  return (
    <div
      className="z-20 flex h-full min-h-0 w-96 shrink-0 flex-col overflow-hidden bg-white shadow-2xl"
      data-parity="discover-sidebar"
    >
      <div className="shrink-0 border-b border-gray-200 p-6" data-parity="discover-sidebar-header">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Nearby Journeys</h2>
            <p className="mt-1 text-sm text-gray-500">
              {resultCount}
              {' '}
              results
              {coordinates ? ` within ${currentRadius} km` : ''}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              aria-label={showFilters ? 'Hide filters' : 'Show filters'}
              className={`rounded-full p-2 transition-colors ${
                showFilters
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
              onClick={onToggleFilters}
              title="Toggle Filters"
              type="button"
            >
              <ExploreIcon aria-hidden="true" className="h-4 w-4" />
            </button>
            <button
              aria-label="Close sidebar"
              className="rounded-full p-1 transition-colors hover:bg-gray-100 lg:hidden"
              onClick={onCloseSidebar}
              type="button"
            >
              <XIcon aria-hidden="true" className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        <label className="relative mb-4 block">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            className="h-11 w-full rounded-full border border-black/5 bg-white pr-4 pl-11 text-sm text-gray-900 shadow-[0_8px_28px_rgba(15,23,42,0.06)] transition outline-none focus:border-[#160E53]/20 focus:ring-4 focus:ring-[#160E53]/8"
            placeholder="Search places, journeys, creators, or tags"
            type="search"
            value={searchQuery}
            onChange={event => onQueryChange(event.target.value)}
          />
        </label>

        <DiscoverFilterChips chips={chips} />

        {coordinates
          ? (
              <div className="mt-4">
                <span className="mb-2 block text-xs font-semibold text-gray-700">Search Radius</span>
                <div className="flex flex-wrap gap-2">
                  {[100, 500, 1000, 5000, 10000].map(radius => (
                    <button
                      key={radius}
                      className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-all duration-200 ${
                        currentRadius === radius
                          ? 'ring-opacity-20 bg-[#160E53] text-white shadow-md ring-2 ring-[#160E53]'
                          : 'border border-gray-300 bg-white text-gray-700 hover:border-[#160E53] hover:text-[#160E53] hover:shadow-sm'
                      }`}
                      disabled={isLoadingJourneys}
                      onClick={() => onRadiusChange(radius)}
                      type="button"
                    >
                      {radius}
                      km
                    </button>
                  ))}
                </div>
              </div>
            )
          : null}
      </div>

      {showFilters
        ? (
            <div className="shrink-0" data-parity="discover-filter-panel">
              <FilterPanel
                disableMotion={disableMotion}
                filters={filters}
                isVisible={showFilters}
                onFiltersChange={onFiltersChange}
                onReset={onResetFilters}
                onToggleVisibility={onToggleFilters}
              />
            </div>
          )
        : null}

      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto" data-parity="discover-sidebar-content">
        {isLoadingJourneys
          ? (
              <div aria-busy="true" className="p-6 text-center" role="status">
                <RefreshCwIcon aria-hidden="true" className="mx-auto mb-4 h-8 w-8 animate-spin text-gray-400" />
                <div className="space-y-2">
                  <div className="mx-auto h-3 w-40 animate-pulse rounded bg-gray-200" />
                  <div className="mx-auto h-3 w-32 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            )
          : journeys.length === 0
            ? (
                <div className="p-6 text-center">
                  <MapPinIcon aria-hidden="true" className="mx-auto mb-4 h-10 w-10 text-gray-300" />
                  <h3 className="mb-2 text-lg font-medium text-gray-900">No nearby journeys</h3>
                  <p className="text-gray-600">
                    No journeys found within
                    {currentRadius}
                    km of your location
                  </p>
                </div>
              )
            : (
                <div data-parity="discover-journey-list">
                  <DiscoverFeed
                    emptyMessage={`No journeys found within ${currentRadius} km of your location`}
                    hoveredItemId={hoveredItemId}
                    items={feedItems}
                    selectedItemId={selectedItemId ?? selectedJourney?.id ?? null}
                    onItemHover={setHoveredItemId}
                    onItemSelect={(itemId) => {
                      const journey = journeys.find(candidate => candidate.id === itemId);

                      if (!journey) {
                        return;
                      }

                      setSelectedItemId(itemId);
                      onJourneySelect(journey);
                    }}
                  />
                </div>
              )}
      </div>
    </div>
  );
};
