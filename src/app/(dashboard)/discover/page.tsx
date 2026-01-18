'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  ChevronRight,
  X,
  Search,
  Navigation,
  RefreshCw,
} from 'lucide-react';

import ExploreMap from '@/components/maps/ExploreMap';
import { JourneyDay, JourneyPlace } from '@/types/journey.types';
import { PageLoading } from '@/components/common';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { useNearbyJourneys } from '@/hooks/useNearbyJourneys';
import { JourneyDetailsModal, JourneyFilters } from '@/components/discover';
import type { JourneyFilterState } from '@/components/discover/JourneyFilters';
import {
  GlobeIcon,
  SpinnerIcon,
  CheckIcon,
  PinIcon,
  CalendarIcon,
  EyeIcon,
  ChevronRightIcon as ChevronRightCustom,
} from '@/components/icons';

export default function DiscoverPage() {
  const [selectedJourney, setSelectedJourney] = useState<any | null>(null);
  const [isJourneyModalOpen, setIsJourneyModalOpen] = useState(false);
  const [modalJourney, setModalJourney] = useState<any | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentRadius, setCurrentRadius] = useState(500); // Maximum allowed by backend
  const [showFilters, setShowFilters] = useState(false);
  const [autoSearch, setAutoSearch] = useState(false); // Disabled by default to prevent infinite loops
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  // Filter state
  const [filters, setFilters] = useState<JourneyFilterState>({
    radius: 500, // Maximum allowed by backend
    dateRange: { from: '', to: '' },
    createdWithin: 'all',
    tags: [],
  });

  // Location and journeys hooks - uses browser geolocation with IP fallback
  const {
    location: currentLocation,
    isLoading: locationLoading,
    error: locationError,
    refresh: refreshLocation,
  } = useCurrentLocation(true); // Auto-fetch on mount

  // Debug logging for location
  useEffect(() => {
    console.log('[DISCOVER_PAGE] Location state updated', {
      hasLocation: !!currentLocation,
      location: currentLocation,
      isLoading: locationLoading,
      error: locationError,
    });
  }, [currentLocation, locationLoading, locationError]);

  // Convert currentLocation to coordinates format for compatibility
  // Memoize to prevent unnecessary re-renders
  const coordinates = useMemo(() => {
    return currentLocation
      ? {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        }
      : null;
  }, [currentLocation]);

  const {
    journeys,
    isLoading: journeysLoading,
    error: journeysError,
    fetchByLocation,
    clearError: clearJourneysError,
  } = useNearbyJourneys();

  // Debug logging for journeys
  useEffect(() => {
    console.log('[DISCOVER_PAGE] Journeys state updated', {
      journeyCount: journeys.length,
      journeys: journeys.map(j => ({
        id: j.id,
        title: j.title,
        dayCount: j.days?.length,
        totalPlaces: j.days?.reduce(
          (sum: number, d: any) => sum + (d.places?.length || 0),
          0
        ),
      })),
      isLoading: journeysLoading,
      error: journeysError,
    });
  }, [journeys, journeysLoading, journeysError]);

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // lg breakpoint
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Set initial state based on screen size
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [searchQuery] = useState('');

  // Track last fetched coordinates/radius to prevent duplicate calls
  const lastFetchedRef = useRef<{
    lat: number | null;
    lng: number | null;
    radius: number;
  }>({ lat: null, lng: null, radius: 0 });

  // Store fetchByLocation in a ref to keep it stable
  const fetchByLocationRef = useRef(fetchByLocation);
  useEffect(() => {
    fetchByLocationRef.current = fetchByLocation;
  }, [fetchByLocation]);

  // Fetch journeys when location becomes available or radius changes
  useEffect(() => {
    console.log('[DISCOVER_PAGE] Location effect triggered', {
      hasCoordinates: !!coordinates,
      coordinates,
      currentRadius,
      lastFetched: lastFetchedRef.current,
    });

    if (coordinates) {
      const shouldFetch =
        lastFetchedRef.current.lat !== coordinates.latitude ||
        lastFetchedRef.current.lng !== coordinates.longitude ||
        lastFetchedRef.current.radius !== currentRadius;

      console.log('[DISCOVER_PAGE] Should fetch?', shouldFetch, {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        radius: currentRadius,
      });

      if (shouldFetch) {
        console.log('[DISCOVER_PAGE] Fetching journeys with new parameters');

        lastFetchedRef.current = {
          lat: coordinates.latitude,
          lng: coordinates.longitude,
          radius: currentRadius,
        };
        fetchByLocationRef.current(coordinates, currentRadius);
      } else {
        console.log('[DISCOVER_PAGE] Skipping fetch - same parameters');
      }
    } else {
      console.log('[DISCOVER_PAGE] No coordinates available yet');
    }
  }, [coordinates, currentRadius]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  // Debounced function to fetch journeys with new radius
  const debouncedFetchJourneys = useCallback(
    (radius: number) => {
      if (coordinates) {
        fetchByLocation(coordinates, radius, 20);
      }
    },
    [coordinates, fetchByLocation]
  );

  // Handle zoom changes to fetch journeys with different radius
  const handleRadiusChange = (newRadius: number) => {
    setCurrentRadius(newRadius);
    setFilters(prev => ({ ...prev, radius: newRadius }));

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer for debounced API call
    const newTimer = setTimeout(() => {
      debouncedFetchJourneys(newRadius);
    }, 300); // 300ms delay - reduced since filter component already debounces

    setDebounceTimer(newTimer);
  };

  const handleFiltersChange = (newFilters: JourneyFilterState) => {
    setFilters(newFilters);
    // Update radius if changed and trigger new fetch
    if (newFilters.radius !== currentRadius) {
      handleRadiusChange(newFilters.radius);
    }
  };

  const handleResetFilters = () => {
    const defaultFilters: JourneyFilterState = {
      radius: 500,
      dateRange: { from: '', to: '' },
      createdWithin: 'all',
      tags: [],
    };
    setFilters(defaultFilters);
    setCurrentRadius(500);
  };

  // Filter journeys based on search query and filters
  const filteredJourneys = journeys.filter(journey => {
    // Text search filter
    const matchesSearch =
      journey.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      journey.description?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Date filters
    if (filters.createdWithin !== 'all') {
      const journeyDate = new Date(journey.createdAt || '');
      const now = new Date();
      const daysDiff = Math.floor(
        (now.getTime() - journeyDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      switch (filters.createdWithin) {
        case 'week':
          if (daysDiff > 7) return false;
          break;
        case 'month':
          if (daysDiff > 30) return false;
          break;
        case 'year':
          if (daysDiff > 365) return false;
          break;
      }
    }

    // Journey date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      // Filter based on journey's first day date if available
      if (journey.days && journey.days.length > 0) {
        const firstDayDate = new Date(journey.days[0].date);

        if (filters.dateRange.from) {
          const fromDate = new Date(filters.dateRange.from);
          if (firstDayDate < fromDate) return false;
        }

        if (filters.dateRange.to) {
          const toDate = new Date(filters.dateRange.to);
          if (firstDayDate > toDate) return false;
        }
      }
    }

    return true;
  });

  // Use filtered journeys directly (no sorting)
  const sortedJourneys = filteredJourneys;

  const handleJourneyClick = (journey: any) => {
    setSelectedJourney(journey);
    // Automatically open sidebar on mobile/tablet to show selection
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(true);
    }
  };

  const handleJourneyModalOpen = (journey: any) => {
    setModalJourney(journey);
    setIsJourneyModalOpen(true);
  };

  const handleJourneyModalClose = () => {
    setIsJourneyModalOpen(false);
    setModalJourney(null);
  };

  // Handle location retry
  const handleLocationRetry = async () => {
    clearJourneysError();
    await refreshLocation();
  };

  // Handle map bounds change (when user zooms or pans)
  const handleMapBoundsChange = useCallback(
    (newCenter: { lat: number; lng: number }, radius: number) => {
      // Only auto-fetch if enabled
      if (!autoSearch) {
        console.log('[DISCOVER_PAGE] Auto-search disabled, skipping fetch');
        return;
      }

      // Cap radius at 20000km (backend max - half of Earth's circumference)
      const cappedRadius = Math.min(radius, 20000);

      console.log(
        '[DISCOVER_PAGE] Map bounds changed, checking if fetch needed',
        {
          center: newCenter,
          originalRadius: radius,
          cappedRadius,
          lastFetched: lastFetchedRef.current,
        }
      );

      // Check if we already fetched for this location
      const last = lastFetchedRef.current;
      if (
        last &&
        last.lat !== null &&
        last.lng !== null &&
        Math.abs(last.lat - newCenter.lat) < 0.001 &&
        Math.abs(last.lng - newCenter.lng) < 0.001 &&
        Math.abs(last.radius - cappedRadius) < 1
      ) {
        console.log('[DISCOVER_PAGE] Same location, skipping fetch');
        return;
      }

      console.log('[DISCOVER_PAGE] Fetching journeys for new area');

      // Update current radius
      setCurrentRadius(cappedRadius);
      setFilters(prev => ({ ...prev, radius: cappedRadius }));

      // Fetch journeys for the new center and radius
      const newCoordinates = {
        latitude: newCenter.lat,
        longitude: newCenter.lng,
      };

      // Update last fetched ref to prevent duplicate calls
      lastFetchedRef.current = {
        lat: newCenter.lat,
        lng: newCenter.lng,
        radius: cappedRadius,
      };

      fetchByLocation(newCoordinates, cappedRadius, 50); // Increase limit for larger areas
    },
    [fetchByLocation, autoSearch]
  );

  // Determine loading state - only show loading if we're actually fetching journeys
  const isLoading = journeysLoading;

  if (isLoading && !journeys.length) {
    const loadingText = locationLoading
      ? 'Getting your location...'
      : 'Loading nearby journeys...';
    return <PageLoading text={loadingText} />;
  }

  // Only show error if it's a journeys error, not location error
  if (journeysError && !locationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <MapPin className="w-12 h-12 mx-auto mb-2" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Journeys
          </h3>
          <p className="text-gray-600 mb-4">{journeysError}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleLocationRetry}
              className="px-4 py-2 bg-[#001A6E] text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50">
      {/* MAIN: full-height area under navbar */}
      <main className="flex h-[calc(100vh-80px)] overflow-hidden">
        <div
          className={`flex-1 relative transition-all duration-300 overflow-hidden ${
            isSidebarOpen ? 'lg:w-[calc(100%-24rem)]' : 'w-full'
          }`}
        >
          {/* Make the map absolutely fill the container */}
          <div className="absolute inset-0 border-2">
            <ExploreMap
              journeys={journeys}
              selectedJourney={selectedJourney}
              center={
                coordinates
                  ? { lat: coordinates.latitude, lng: coordinates.longitude }
                  : undefined
              }
              onBoundsChange={handleMapBoundsChange}
            />
          </div>

          {/* Map Controls */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="bg-white rounded-lg shadow-lg p-3 hover:shadow-xl transition-all duration-200"
            >
              <motion.div
                animate={{ rotate: isSidebarOpen ? 0 : 180 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </motion.div>
            </motion.button>

            {/* Location Controls */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              onClick={refreshLocation}
              disabled={locationLoading}
              className="bg-white rounded-lg shadow-lg p-3 hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              title="Refresh location"
            >
              {locationLoading ? (
                <RefreshCw className="w-5 h-5 text-gray-600 animate-spin" />
              ) : (
                <Navigation className="w-5 h-5 text-gray-600" />
              )}
            </motion.button>

            {/* Auto-Search Toggle */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setAutoSearch(!autoSearch)}
              className={`rounded-lg shadow-lg p-3 hover:shadow-xl transition-all duration-200 ${
                autoSearch ? 'bg-[#001A6E]' : 'bg-white'
              }`}
              title={autoSearch ? 'Auto-search: ON' : 'Auto-search: OFF'}
            >
              <Search
                className={`w-5 h-5 ${
                  autoSearch ? 'text-white' : 'text-gray-600'
                }`}
              />
            </motion.button>

            {/* Global Search Button */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => {
                if (coordinates) {
                  console.log('[DEBUG] Searching worldwide (10000km radius)');
                  setCurrentRadius(10000);
                  setFilters(prev => ({ ...prev, radius: 10000 }));
                  fetchByLocation(coordinates, 10000, 100);
                }
              }}
              className="bg-green-600 rounded-lg shadow-lg p-3 hover:shadow-xl transition-all duration-200 text-white"
              title="Search Worldwide"
            >
              <GlobeIcon className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Map Statistics & Legend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4 max-w-xs"
          >
            {/* Statistics */}
            <div className="mb-4 pb-3 border-b border-gray-200">
              <h4 className="text-xs font-semibold text-gray-700 mb-2">
                Map Statistics
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                <div className="bg-blue-50 rounded-md px-2 py-1.5">
                  <div className="text-gray-500">Journeys</div>
                  <div className="font-bold text-gray-900">
                    {sortedJourneys.length}
                  </div>
                </div>
                <div className="bg-green-50 rounded-md px-2 py-1.5">
                  <div className="text-gray-500">Places</div>
                  <div className="font-bold text-gray-900">
                    {sortedJourneys.reduce(
                      (total, journey) =>
                        total +
                        (journey.days?.reduce(
                          (dayTotal: number, day: JourneyDay) =>
                            dayTotal + (day.places?.length || 0),
                          0
                        ) || 0),
                      0
                    )}
                  </div>
                </div>
              </div>
              {/* Location Status */}
              <div className="text-xs">
                <div className="flex items-center gap-1.5 mb-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      currentLocation
                        ? 'bg-green-500'
                        : locationLoading
                        ? 'bg-yellow-500 animate-pulse'
                        : 'bg-red-500'
                    }`}
                  ></div>
                  <span className="text-gray-600">
                    {currentLocation
                      ? 'Location found'
                      : locationLoading
                      ? 'Finding location...'
                      : 'Location unavailable'}
                  </span>
                </div>
                {currentLocation && (
                  <div className="text-gray-500 ml-3.5">
                    {currentLocation.latitude.toFixed(4)},{' '}
                    {currentLocation.longitude.toFixed(4)}
                  </div>
                )}
                {journeysLoading && (
                  <div className="flex items-center gap-1.5 text-blue-600 ml-3.5 animate-pulse">
                    <SpinnerIcon className="w-3 h-3" />
                    <span>Searching area...</span>
                  </div>
                )}
                <div className="text-gray-500 ml-3.5 mt-1">
                  Radius: {currentRadius}km
                </div>
                <div className="flex items-center gap-1.5 ml-3.5 mt-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      autoSearch ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  ></div>
                  <span className="text-gray-500 text-xs">
                    Auto-search: {autoSearch ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <h4 className="text-xs font-semibold text-gray-700 mb-2">
              Place Types
            </h4>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#001A6E] rounded-full flex items-center justify-center text-xs">
                  🏨
                </div>
                <span className="text-xs text-gray-600">Accommodation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-xs">
                  🎯
                </div>
                <span className="text-xs text-gray-600">Activity</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-xs">
                  🍽️
                </div>
                <span className="text-xs text-gray-600">Food & Dining</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs">
                  🚗
                </div>
                <span className="text-xs text-gray-600">Transport</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center text-xs">
                  📝
                </div>
                <span className="text-xs text-gray-600">Notes</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT SIDEBAR — now a sibling in the flex layout. Only this area scrolls. */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ x: 384, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 384, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-96 bg-white shadow-2xl z-20 flex flex-col h-full"
            >
              {/* Sidebar Header */}
              <div className="p-6 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Nearby Journeys
                    </h2>
                    {coordinates && (
                      <p className="text-sm text-gray-500 mt-1">
                        Within {currentRadius}km radius
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`p-2 rounded-full transition-colors ${
                        showFilters
                          ? 'bg-blue-100 text-blue-600'
                          : 'hover:bg-gray-100 text-gray-400'
                      }`}
                      title="Toggle Filters"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors lg:hidden"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Radius Controls */}
                {coordinates && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-gray-600">Radius:</span>
                    <div className="flex gap-1 flex-wrap">
                      {[100, 500, 1000, 5000, 10000].map(radius => (
                        <button
                          key={radius}
                          onClick={() => handleRadiusChange(radius)}
                          disabled={journeysLoading}
                          className={`px-3 py-1 text-xs rounded-full transition-colors ${
                            currentRadius === radius
                              ? 'bg-[#001A6E] text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          } disabled:opacity-50`}
                        >
                          {radius}km
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Filters Section */}
              {showFilters && (
                <div className="flex-shrink-0">
                  <JourneyFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onReset={handleResetFilters}
                    isVisible={showFilters}
                    onToggleVisibility={() => setShowFilters(false)}
                  />
                </div>
              )}

              {/* Nearby Journeys List (scrollable) */}
              <div className="flex-1 overflow-y-auto min-h-0">
                {journeysLoading ? (
                  <div className="p-6 text-center">
                    <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600">Loading nearby journeys...</p>
                  </div>
                ) : sortedJourneys.length === 0 ? (
                  <div className="p-6 text-center">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {!coordinates && locationError
                        ? 'Using approximate location'
                        : !coordinates
                        ? 'Getting your location...'
                        : 'No nearby journeys'}
                    </h3>
                    <p className="text-gray-600">
                      {!coordinates && locationError
                        ? 'Using IP-based approximate location to find journeys near you.'
                        : !coordinates
                        ? 'Please wait while we determine your location...'
                        : `No journeys found within ${currentRadius}km of your location`}
                    </p>
                    {!coordinates && locationError && (
                      <div className="mt-4 space-y-2">
                        <button
                          onClick={handleLocationRetry}
                          className="px-4 py-2 bg-[#001A6E] text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                        >
                          <Navigation className="w-4 h-4" />
                          Try Again
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {sortedJourneys.map((journey, index) => {
                      const getDistance = () => {
                        if (journey.distance !== undefined) {
                          return `${journey.distance.toFixed(1)}km away`;
                        }
                        return null;
                      };

                      // Calculate place types breakdown
                      const getPlaceTypesBreakdown = () => {
                        const typeCounts: { [key: string]: number } = {};
                        if (journey.days) {
                          journey.days.forEach((day: JourneyDay) => {
                            day.places?.forEach((place: JourneyPlace) => {
                              const type = place.type.toLowerCase();
                              typeCounts[type] = (typeCounts[type] || 0) + 1;
                            });
                          });
                        }
                        return typeCounts;
                      };

                      const placeTypes = getPlaceTypesBreakdown();

                      const isSelected = selectedJourney?.id === journey.id;

                      return (
                        <motion.div
                          key={journey.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ y: -4, transition: { duration: 0.2 } }}
                          onClick={() => handleJourneyClick(journey)}
                          className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 ${
                            isSelected
                              ? 'shadow-2xl ring-4 ring-blue-900 ring-opacity-50'
                              : 'shadow-md hover:shadow-xl hover:ring-2 hover:ring-blue-900 hover:ring-opacity-20'
                          }`}
                        >
                          {/* Gradient Background */}
                          <div
                            className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-300 ${
                              isSelected
                                ? 'from-blue-900 via-blue-900 to-blue-800 opacity-100'
                                : 'from-blue-900 via-blue-800 to-blue-700 opacity-0 group-hover:opacity-8'
                            }`}
                          />

                          {/* Content */}
                          <div
                            className={`relative ${
                              isSelected
                                ? 'bg-white/95 backdrop-blur-sm'
                                : 'bg-white'
                            }`}
                          >
                            <div className="p-4">
                              {/* Title Section */}
                              <div className="mb-3">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <h3
                                    className={`font-bold text-lg leading-tight line-clamp-2 flex-1 ${
                                      isSelected
                                        ? 'text-blue-900'
                                        : 'text-gray-900 group-hover:text-blue-900'
                                    }`}
                                  >
                                    {journey.title}
                                  </h3>
                                  {isSelected && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="flex-shrink-0"
                                    >
                                      <div className="w-8 h-8 bg-gradient-to-br from-blue-900 to-blue-950 rounded-full flex items-center justify-center shadow-lg">
                                        <CheckIcon className="w-4 h-4 text-white" />
                                      </div>
                                    </motion.div>
                                  )}
                                </div>

                                {/* User & Distance */}
                                <div className="flex items-center gap-2 text-xs">
                                  <div className="flex items-center gap-1.5 text-gray-600">
                                    <div className="w-5 h-5 bg-gradient-to-br from-blue-900 to-blue-950 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                                      <span className="text-white text-xs font-bold">
                                        {(
                                          journey.author?.username ||
                                          journey.user?.username
                                        )
                                          .charAt(0)
                                          .toUpperCase()}
                                      </span>
                                    </div>
                                    <span className="font-medium">
                                      {journey.author?.username ||
                                        journey.user?.username}
                                    </span>
                                  </div>
                                  {getDistance() && (
                                    <>
                                      <span className="text-gray-300">•</span>
                                      <div className="flex items-center gap-1 text-gray-500">
                                        <PinIcon className="w-3 h-3" />
                                        <span className="font-medium">
                                          {getDistance()}
                                        </span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Place Types Badges */}
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {placeTypes.stay > 0 && (
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-700 rounded-full text-xs font-semibold shadow-sm"
                                  >
                                    <span>🏨</span>
                                    <span>{placeTypes.stay}</span>
                                  </motion.div>
                                )}
                                {placeTypes.activity > 0 && (
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 text-green-700 rounded-full text-xs font-semibold shadow-sm"
                                  >
                                    <span>🎯</span>
                                    <span>{placeTypes.activity}</span>
                                  </motion.div>
                                )}
                                {placeTypes.food > 0 && (
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 rounded-full text-xs font-semibold shadow-sm"
                                  >
                                    <span>🍽️</span>
                                    <span>{placeTypes.food}</span>
                                  </motion.div>
                                )}
                                {placeTypes.transport > 0 && (
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 text-purple-700 rounded-full text-xs font-semibold shadow-sm"
                                  >
                                    <span>🚗</span>
                                    <span>{placeTypes.transport}</span>
                                  </motion.div>
                                )}
                                {placeTypes.note > 0 && (
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 text-yellow-700 rounded-full text-xs font-semibold shadow-sm"
                                  >
                                    <span>📝</span>
                                    <span>{placeTypes.note}</span>
                                  </motion.div>
                                )}
                              </div>

                              {/* Journey Stats with Icons */}
                              <div
                                className={`flex items-center gap-3 text-xs pt-3 border-t ${
                                  isSelected
                                    ? 'border-blue-900/20'
                                    : 'border-gray-100'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 text-gray-600">
                                  <PinIcon className="w-4 h-4 text-blue-900" />
                                  <span className="font-semibold">
                                    {journey.days?.reduce(
                                      (total: number, day: JourneyDay) =>
                                        total + (day.places?.length || 0),
                                      0
                                    ) || 0}
                                  </span>
                                  <span className="text-gray-500">places</span>
                                </div>
                                <span className="text-gray-300">•</span>
                                <div className="flex items-center gap-1.5 text-gray-600">
                                  <CalendarIcon className="w-4 h-4 text-blue-900" />
                                  <span className="font-semibold">
                                    {journey.days?.length || 0}
                                  </span>
                                  <span className="text-gray-500">days</span>
                                </div>
                              </div>

                              {/* View Details Button - Only show when selected */}
                              {isSelected && (
                                <motion.button
                                  initial={{
                                    opacity: 0,
                                    height: 0,
                                    marginTop: 0,
                                  }}
                                  animate={{
                                    opacity: 1,
                                    height: 'auto',
                                    marginTop: 12,
                                  }}
                                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleJourneyModalOpen(journey);
                                  }}
                                  className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-900 to-blue-950 text-white rounded-lg hover:from-blue-800 hover:to-blue-900 transition-all duration-200 text-sm font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                                >
                                  <EyeIcon className="w-4 h-4" />
                                  View Full Journey
                                  <ChevronRightCustom className="w-4 h-4" />
                                </motion.button>
                              )}
                            </div>
                          </div>

                          {/* Decorative Corner Element */}
                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-900/25 to-transparent rounded-bl-full"
                            />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Overlay for mobile (covers the whole viewport, closes sidebar) */}
      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/20 z-10 lg:hidden"
        />
      )}

      {/* Journey Details Modal */}
      <JourneyDetailsModal
        isOpen={isJourneyModalOpen}
        onClose={handleJourneyModalClose}
        journey={modalJourney}
      />
    </div>
  );
}
