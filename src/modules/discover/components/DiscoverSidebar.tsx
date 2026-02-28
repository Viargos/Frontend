'use client';

import type { JourneyFilterState } from '@/modules/discover/components/FilterPanel';
import type { DiscoverCoordinates, DiscoverJourney } from '@/modules/discover/types/discover.types';
import * as motion from 'framer-motion/client';
import { CheckIcon, ChevronRightIcon, ExploreIcon, EyeIcon, MapPinIcon, RefreshCwIcon, XIcon } from '@/modules/common/icons';
import { FilterPanel } from '@/modules/discover/components/FilterPanel';

type DiscoverSidebarProps = {
  coordinates: DiscoverCoordinates | null;
  currentRadius: number;
  disableMotion?: boolean;
  filters: JourneyFilterState;
  isLoadingJourneys: boolean;
  isSidebarOpen: boolean;
  journeys: DiscoverJourney[];
  onCloseSidebar: () => void;
  onFiltersChange: (filters: JourneyFilterState) => void;
  onJourneyModalOpen: (journey: DiscoverJourney) => void;
  onJourneySelect: (journey: DiscoverJourney) => void;
  onRadiusChange: (radius: number) => void;
  onResetFilters: () => void;
  onToggleFilters: () => void;
  selectedJourney: DiscoverJourney | null;
  showFilters: boolean;
};

export const DiscoverSidebar = (props: DiscoverSidebarProps) => {
  const {
    coordinates,
    currentRadius,
    disableMotion = false,
    filters,
    isLoadingJourneys,
    isSidebarOpen,
    journeys,
    onCloseSidebar,
    onFiltersChange,
    onJourneyModalOpen,
    onJourneySelect,
    onRadiusChange,
    onResetFilters,
    onToggleFilters,
    selectedJourney,
    showFilters,
  } = props;

  if (!isSidebarOpen) {
    return null;
  }

  return (
    <div
      className="z-20 flex h-[calc(100vh-80px)] w-96 flex-col bg-white shadow-2xl"
      data-parity="discover-sidebar"
    >
      <div className="flex-shrink-0 border-b border-gray-200 p-6" data-parity="discover-sidebar-header">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Nearby Journeys</h2>
            {coordinates
              ? (
                  <p className="mt-1 text-sm text-gray-500">
                    Within
                    {currentRadius}
                    km radius
                  </p>
                )
              : null}
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

        {coordinates
          ? (
              <div className="mb-4">
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
            <div className="flex-shrink-0" data-parity="discover-filter-panel">
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

      <div className="min-h-0 flex-1 overflow-y-auto" data-parity="discover-sidebar-content">
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
                <div className="space-y-3 p-4" data-parity="discover-journey-list">
                  {journeys.map((journey, index) => {
                    const isSelected = selectedJourney?.id === journey.id;

                    return (
                      <motion.div
                        key={journey.id}
                        animate={{ opacity: 1, y: 0 }}
                        className={`group relative cursor-pointer overflow-hidden rounded-xl transition-all duration-300 ${
                          isSelected
                            ? 'ring-opacity-50 shadow-2xl ring-4 ring-blue-900'
                            : 'hover:ring-opacity-20 shadow-md hover:shadow-xl hover:ring-2 hover:ring-blue-900'
                        }`}
                        initial={{ opacity: 0, y: 20 }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            onJourneySelect(journey);
                          }
                        }}
                        transition={disableMotion ? { duration: 0 } : { delay: index * 0.1 }}
                        whileHover={disableMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}
                        onClick={() => onJourneySelect(journey)}
                        role="button"
                        tabIndex={0}
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-300 ${
                            isSelected
                              ? 'from-blue-900 via-blue-900 to-blue-800 opacity-100'
                              : 'from-blue-900 via-blue-800 to-blue-700 opacity-0 group-hover:opacity-8'
                          }`}
                        />

                        <div className={isSelected ? 'relative bg-white/95 backdrop-blur-sm' : 'relative bg-white'}>
                          <div className="p-4">
                            <div className="mb-3">
                              <div className="mb-2 flex items-start justify-between gap-2">
                                <h3 className={`line-clamp-2 flex-1 text-lg leading-tight font-bold ${isSelected ? 'text-blue-900' : 'text-gray-900 group-hover:text-blue-900'}`}>
                                  {journey.title}
                                </h3>
                                {isSelected
                                  ? (
                                      <motion.div
                                        animate={{ scale: 1 }}
                                        className="flex-shrink-0"
                                        initial={{ scale: 0 }}
                                        transition={disableMotion ? { duration: 0 } : undefined}
                                      >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-900 to-blue-950 shadow-lg">
                                          <CheckIcon aria-hidden="true" className="h-4 w-4 text-white" />
                                        </div>
                                      </motion.div>
                                    )
                                  : null}
                              </div>

                              <div className="flex items-center gap-2 text-xs">
                                <div className="flex items-center gap-1.5 text-gray-600">
                                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-900 to-blue-950 shadow-sm">
                                    <span className="text-xs font-bold text-white">{journey.title.charAt(0).toUpperCase()}</span>
                                  </div>
                                  <span className="font-medium">Journey Creator</span>
                                </div>
                              </div>
                            </div>

                            <div className="mb-3 flex flex-wrap gap-1.5">
                              <div className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 shadow-sm">
                                <EyeIcon aria-hidden="true" className="h-3 w-3" />
                                <span>{journey.places.length}</span>
                              </div>
                            </div>

                            <div className={`flex items-center gap-3 border-t pt-3 text-xs ${isSelected ? 'border-blue-900/20' : 'border-gray-100'}`}>
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <MapPinIcon aria-hidden="true" className="h-3 w-3 text-[#160E53]" />
                                <span className="font-semibold">{journey.places.length}</span>
                                <span className="text-gray-500">places</span>
                              </div>
                              <span className="text-gray-300">•</span>
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <MapPinIcon aria-hidden="true" className="h-3 w-3 text-[#160E53]" />
                                <span className="font-semibold">1</span>
                                <span className="text-gray-500">day</span>
                              </div>
                            </div>

                            {isSelected
                              ? (
                                  <motion.button
                                    animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-900 to-blue-950 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-800 hover:to-blue-900 hover:shadow-xl"
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    transition={disableMotion ? { duration: 0 } : undefined}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      onJourneyModalOpen(journey);
                                    }}
                                    type="button"
                                  >
                                    <EyeIcon aria-hidden="true" className="h-3 w-3" />
                                    View Full Journey
                                    <ChevronRightIcon aria-hidden="true" className="h-3 w-3" />
                                  </motion.button>
                                )
                              : null}
                          </div>
                        </div>

                        {isSelected
                          ? (
                              <motion.div
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute top-0 right-0 h-20 w-20 rounded-bl-full bg-gradient-to-bl from-blue-900/25 to-transparent"
                                initial={{ opacity: 0, scale: 0 }}
                                transition={disableMotion ? { duration: 0 } : undefined}
                              />
                            )
                          : null}
                      </motion.div>
                    );
                  })}
                </div>
              )}
      </div>
    </div>
  );
};
