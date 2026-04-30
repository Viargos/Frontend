'use client';

import type { JourneyFilterState } from '@/modules/discover/components/FilterPanel';
import type { DiscoverFeedItem } from '@/modules/discover/types/discover-ui.types';
import type { DiscoverJourney } from '@/modules/discover/types/discover.types';
import * as motion from 'framer-motion/client';
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { RefreshCwIcon, XIcon } from '@/modules/common/icons';
import { DiscoverShell } from '@/modules/discover/components/DiscoverShell';
import { DiscoverSidebar } from '@/modules/discover/components/DiscoverSidebar';
import { JourneyDetailsModal } from '@/modules/discover/components/JourneyDetailsModal';
import { MapPanel } from '@/modules/discover/components/MapPanel';
import { useDiscover } from '@/modules/discover/hooks/use-discover';
import { mapDiscoverFeedItems } from '@/modules/discover/mappers/discover-feed.mapper';
import { useDiscoverStore } from '@/modules/discover/store/discover.store';

type DiscoverParityState = 'default' | 'empty' | 'error' | 'loading';

export type DiscoverParityConfig = {
  enabled: boolean;
  forceFilters: boolean | null;
  forceModal: boolean;
  forceSidebar: boolean | null;
  state: DiscoverParityState;
};

const DEFAULT_PARITY_CONFIG: DiscoverParityConfig = {
  enabled: false,
  forceFilters: null,
  forceModal: false,
  forceSidebar: null,
  state: 'default',
};

type DiscoverPageClientProps = {
  parityConfig?: DiscoverParityConfig;
};

function subscribeToViewportWidth(onStoreChange: () => void) {
  window.addEventListener('resize', onStoreChange);
  return () => {
    window.removeEventListener('resize', onStoreChange);
  };
}

function getClientSidebarSnapshot() {
  return window.innerWidth >= 1024;
}

function getServerSidebarSnapshot() {
  return false;
}

function matchesSearchQuery(item: DiscoverFeedItem, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const haystack = [
    item.title,
    item.subtitle,
    item.locationLabel,
    item.creator.name,
    ...item.tags,
  ]
    .filter((value): value is string => Boolean(value))
    .join(' ')
    .toLowerCase();

  return haystack.includes(normalizedQuery);
}

export const DiscoverPageClient = (props: DiscoverPageClientProps) => {
  const parityConfig = props.parityConfig ?? DEFAULT_PARITY_CONFIG;
  const {
    coordinates,
    error,
    isLoadingJourneys,
    isLoadingLocation,
    journeys,
    radius,
    refresh,
    updateRadius,
  } = useDiscover();

  const disableMotion = parityConfig.enabled;
  const [selectedJourney, setSelectedJourney] = useState<DiscoverJourney | null>(null);
  const [isJourneyModalOpen, setIsJourneyModalOpen] = useState(false);
  const [modalJourney, setModalJourney] = useState<DiscoverJourney | null>(null);
  const [manualSidebarOpen, setManualSidebarOpen] = useState<boolean | null>(null);
  const [showFilters, setShowFilters] = useState(() => parityConfig.forceFilters ?? false);
  const [autoSearch, setAutoSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const selectedItemId = useDiscoverStore(state => state.selectedItemId);
  const setHoveredItemId = useDiscoverStore(state => state.setHoveredItemId);
  const setSelectedItemId = useDiscoverStore(state => state.setSelectedItemId);
  const isDesktopViewport = useSyncExternalStore(
    subscribeToViewportWidth,
    getClientSidebarSnapshot,
    getServerSidebarSnapshot,
  );

  const [filters, setFilters] = useState<JourneyFilterState>({
    createdWithin: 'all',
    dateRange: { from: '', to: '' },
    radius,
    tags: [],
  });

  const handleRadiusChange = useCallback((nextRadius: number) => {
    setFilters(previous => ({
      ...previous,
      radius: nextRadius,
    }));
    void updateRadius(nextRadius);
  }, [updateRadius]);

  const handleFiltersChange = useCallback((nextFilters: JourneyFilterState) => {
    setFilters(nextFilters);

    if (nextFilters.radius !== radius) {
      void updateRadius(nextFilters.radius);
    }
  }, [radius, updateRadius]);

  const handleResetFilters = useCallback(() => {
    const nextFilters: JourneyFilterState = {
      createdWithin: 'all',
      dateRange: { from: '', to: '' },
      radius: 500,
      tags: [],
    };

    setFilters(nextFilters);
    void updateRadius(500);
  }, [updateRadius]);

  const filteredJourneys = useMemo(() => journeys.filter((journey) => {
    if (filters.createdWithin === 'all') {
      return true;
    }

    const journeyDate = new Date(journey.createdAt);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - journeyDate.getTime()) / (1000 * 60 * 60 * 24));

    if (filters.createdWithin === 'week' && daysDiff > 7) {
      return false;
    }

    if (filters.createdWithin === 'month' && daysDiff > 30) {
      return false;
    }

    if (filters.createdWithin === 'year' && daysDiff > 365) {
      return false;
    }

    return true;
  }), [filters.createdWithin, journeys]);

  const discoverJourneys = useMemo(() => (parityConfig.state === 'empty'
    ? []
    : filteredJourneys), [filteredJourneys, parityConfig.state]);
  const discoverFeedItems = useMemo(
    () => mapDiscoverFeedItems(discoverJourneys),
    [discoverJourneys],
  );
  const visibleFeedItems = useMemo(
    () => discoverFeedItems.filter(item => matchesSearchQuery(item, searchQuery)),
    [discoverFeedItems, searchQuery],
  );
  const visibleJourneyIds = useMemo(
    () => new Set(visibleFeedItems.map(item => item.journeyId ?? item.id)),
    [visibleFeedItems],
  );
  const visibleJourneys = useMemo(
    () => discoverJourneys.filter(journey => visibleJourneyIds.has(journey.id)),
    [discoverJourneys, visibleJourneyIds],
  );
  const selectedJourneyStillVisible = selectedJourney
    ? visibleJourneyIds.has(selectedJourney.id)
    : false;
  const forcedJourney = parityConfig.enabled && parityConfig.forceModal && discoverJourneys.length > 0
    ? visibleJourneys[0] ?? discoverJourneys[0]
    : null;
  const sidebarOpen = parityConfig.forceSidebar ?? manualSidebarOpen ?? isDesktopViewport;
  const filtersVisible = parityConfig.forceFilters ?? showFilters;
  const activeSelectedJourney = forcedJourney ?? (selectedJourneyStillVisible ? selectedJourney : null);
  const activeModalJourney = forcedJourney ?? modalJourney;
  const activeModalOpen = forcedJourney !== null || isJourneyModalOpen;
  const autoSearchEnabled = parityConfig.enabled ? false : autoSearch;

  useEffect(() => {
    const nextSelectedItemId = forcedJourney?.id ?? activeSelectedJourney?.id ?? null;
    setSelectedItemId(nextSelectedItemId);
  }, [activeSelectedJourney?.id, forcedJourney?.id, setSelectedItemId]);

  useEffect(() => {
    setHoveredItemId(null);
  }, [setHoveredItemId]);

  const toggleSidebar = useCallback(() => {
    if (parityConfig.forceSidebar !== null) {
      return;
    }
    setManualSidebarOpen(previous => !(previous ?? isDesktopViewport));
  }, [isDesktopViewport, parityConfig.forceSidebar]);

  const closeSidebar = useCallback(() => {
    if (parityConfig.forceSidebar !== null) {
      return;
    }
    setManualSidebarOpen(false);
  }, [parityConfig.forceSidebar]);

  const toggleFilters = useCallback(() => {
    if (parityConfig.forceFilters !== null) {
      return;
    }
    setShowFilters(previous => !previous);
  }, [parityConfig.forceFilters]);

  const handleMapJourneySelect = useCallback((journey: DiscoverJourney) => {
    setSelectedJourney(journey);
    if (window.innerWidth < 1024 && parityConfig.forceSidebar === null) {
      setManualSidebarOpen(true);
    }
  }, [parityConfig.forceSidebar]);

  const handleRefreshLocation = useCallback(() => {
    void refresh();
  }, [refresh]);

  const handleSearchGlobal = useCallback(() => {
    void updateRadius(10000);
  }, [updateRadius]);

  const handleToggleAutoSearch = useCallback(() => {
    if (parityConfig.enabled) {
      return;
    }
    setAutoSearch(previous => !previous);
  }, [parityConfig.enabled]);
  const handleClearDateRange = useCallback(() => {
    setFilters(previous => ({
      ...previous,
      dateRange: { from: '', to: '' },
    }));
  }, []);
  const handleClearQuery = useCallback(() => {
    setSearchQuery('');
  }, []);
  const handleResetRadius = useCallback(() => {
    const nextRadius = 500;
    setFilters(previous => ({
      ...previous,
      radius: nextRadius,
    }));
    void updateRadius(nextRadius);
  }, [updateRadius]);
  const handleResetTimeFilter = useCallback(() => {
    setFilters(previous => ({
      ...previous,
      createdWithin: 'all',
    }));
  }, []);

  if (parityConfig.enabled && parityConfig.state === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50" data-parity="discover-loading-state">
        <div aria-busy="true" className="text-center" role="status">
          <RefreshCwIcon aria-hidden="true" className="mx-auto mb-4 h-10 w-10 animate-spin text-gray-400" />
          <div className="space-y-2">
            <div className="mx-auto h-4 w-52 animate-pulse rounded bg-gray-200" />
            <div className="mx-auto h-4 w-40 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if ((parityConfig.enabled && parityConfig.state === 'error') || (error && !isLoadingLocation)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50" data-parity="discover-error-state">
        <div className="text-center">
          <XIcon aria-hidden="true" className="mx-auto mb-2 h-10 w-10 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Error Loading Journeys</h3>
          <p className="mb-4 text-gray-600">{error ?? 'Parity forced error'}</p>
          <button
            className="flex items-center gap-2 rounded-lg bg-[#160E53] px-4 py-2 text-white transition-colors hover:bg-blue-700"
            onClick={() => void refresh()}
            type="button"
          >
            <RefreshCwIcon aria-hidden="true" className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <DiscoverShell hasSelection={selectedItemId !== null} itemCount={visibleFeedItems.length}>
      <main className="flex min-h-0 flex-1 overflow-hidden" data-parity="discover-main-layout">
        <MapPanel
          autoSearch={autoSearchEnabled}
          coordinates={coordinates}
          feedItems={visibleFeedItems}
          isLoadingLocation={isLoadingLocation}
          isSidebarOpen={sidebarOpen}
          journeys={visibleJourneys}
          onOpenJourneyDetails={(journey) => {
            setModalJourney(journey);
            setIsJourneyModalOpen(true);
          }}
          selectedJourney={activeSelectedJourney}
          onRefreshLocation={handleRefreshLocation}
          onSearchGlobal={handleSearchGlobal}
          onSelectJourney={handleMapJourneySelect}
          onToggleAutoSearch={handleToggleAutoSearch}
          onToggleSidebar={toggleSidebar}
        />

        <DiscoverSidebar
          coordinates={coordinates}
          disableMotion={disableMotion}
          currentRadius={radius}
          feedItems={visibleFeedItems}
          filters={filters}
          isLoadingJourneys={isLoadingJourneys}
          isSidebarOpen={sidebarOpen}
          journeys={visibleJourneys}
          onClearDateRange={handleClearDateRange}
          onClearQuery={handleClearQuery}
          selectedJourney={activeSelectedJourney}
          showFilters={filtersVisible}
          onCloseSidebar={closeSidebar}
          onFiltersChange={handleFiltersChange}
          onJourneySelect={setSelectedJourney}
          onQueryChange={setSearchQuery}
          onResetRadius={handleResetRadius}
          onRadiusChange={handleRadiusChange}
          onResetFilters={handleResetFilters}
          onResetTimeFilter={handleResetTimeFilter}
          onToggleFilters={toggleFilters}
          resultCount={visibleFeedItems.length}
          searchQuery={searchQuery}
        />
      </main>

      {sidebarOpen && parityConfig.forceSidebar === null
        ? (
            <motion.div
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-10 bg-black/20 lg:hidden"
              data-parity="discover-mobile-overlay"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              onClick={closeSidebar}
            />
          )
        : null}

      <JourneyDetailsModal
        disableMotion={disableMotion}
        isOpen={activeModalOpen}
        journey={activeModalJourney}
        onClose={() => {
          if (forcedJourney) {
            return;
          }
          setIsJourneyModalOpen(false);
          setModalJourney(null);
        }}
      />
    </DiscoverShell>
  );
};
