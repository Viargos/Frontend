"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Calendar,
  User,
  ChevronRight,
  X,
  Search,
  Navigation,
  RefreshCw,
} from "lucide-react";
import apiClient from "@/lib/api.legacy";
import ExploreMap from "@/components/maps/ExploreMap";
import { Journey } from "@/types/journey.types";
import { PlaceType } from "@/types/journey.types";
import { PageLoading } from "@/components/common/Loading";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useNearbyJourneys } from "@/hooks/useNearbyJourneys";
import JourneyDetailsModal from "@/components/discover/JourneyDetailsModal";

export default function DiscoverPage() {
  const [selectedJourney, setSelectedJourney] = useState<any | null>(null);
  const [isJourneyModalOpen, setIsJourneyModalOpen] = useState(false);
  const [modalJourney, setModalJourney] = useState<any | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentRadius, setCurrentRadius] = useState(50);

  // Location and journeys hooks
  const {
    coordinates,
    isLoading: locationLoading,
    error: locationError,
    getCurrentLocation,
    clearError: clearLocationError,
  } = useGeolocation();

  const {
    journeys,
    isLoading: journeysLoading,
    error: journeysError,
    fetchByLocation,
    clearError: clearJourneysError,
  } = useNearbyJourneys();

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

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | PlaceType>("all");

  // Get user location on mount and fetch journeys when location is available
  useEffect(() => {
    getCurrentLocation().catch(() => {
      // If location fails, use default location (Ahmedabad, Gujarat)
      const defaultLocation = { latitude: 23.0225, longitude: 72.5714 };
      fetchByLocation(defaultLocation, currentRadius);
    });
  }, [getCurrentLocation, fetchByLocation, currentRadius]);

  // Fetch journeys when location becomes available or radius changes
  useEffect(() => {
    if (coordinates) {
      fetchByLocation(coordinates, currentRadius);
    }
  }, [coordinates, currentRadius]);

  // Handle zoom changes to fetch journeys with different radius
  const handleRadiusChange = (newRadius: number) => {
    setCurrentRadius(newRadius);
    // The useEffect will automatically trigger fetchByLocation when currentRadius changes
  };

  // Filter journeys based on search query
  const filteredJourneys = journeys.filter(
    (journey) =>
      journey.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      journey.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJourneyClick = (journey: any) => {
    setSelectedJourney(journey);
  };

  const handleJourneyModalOpen = (journey: any) => {
    setModalJourney(journey);
    setIsJourneyModalOpen(true);
  };

  const handleJourneyModalClose = () => {
    setIsJourneyModalOpen(false);
    setModalJourney(null);
  };

  const handleShowAllJourneys = () => {
    setSelectedJourney(null);
  };

  const handleLocationClick = (location: any) => {
    if (location.journey && !selectedJourney) {
      handleJourneyClick(location.journey);
    }
  };

  // Handle location retry
  const handleLocationRetry = async () => {
    clearLocationError();
    clearJourneysError();
    await getCurrentLocation();
  };

  // Determine loading state - only show loading if we're actually fetching journeys
  const isLoading = journeysLoading;
  const error = locationError || journeysError;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPlaceTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "stay":
        return "🏨";
      case "activity":
        return "🎯";
      case "food":
        return "🍽️";
      case "transport":
        return "🚗";
      case "note":
        return "📝";
      default:
        return "📍";
    }
  };

  if (isLoading && !journeys.length) {
    const loadingText = locationLoading
      ? "Getting your location..."
      : "Loading nearby journeys...";
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
            <button
              onClick={() => {
                // Fallback to default location (example: Ahmedabad)
                fetchByLocation(
                  { latitude: 23.0225, longitude: 72.5714 },
                  currentRadius
                );
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Use Default Location
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50 relative overflow-hidden">
      {/* Map Container */}
      <div
        className={`flex-1 relative transition-all duration-300 ${
          isSidebarOpen ? "lg:mr-96" : "mr-0"
        }`}
      >
        <ExploreMap
          journeys={journeys}
          selectedJourney={selectedJourney}
          onLocationClick={handleLocationClick}
        />

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
            onClick={getCurrentLocation}
            disabled={locationLoading}
            className="bg-white rounded-lg shadow-lg p-3 hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            title="Get current location"
          >
            {locationLoading ? (
              <RefreshCw className="w-5 h-5 text-gray-600 animate-spin" />
            ) : (
              <Navigation className="w-5 h-5 text-gray-600" />
            )}
          </motion.button>
        </div>

        {/* Selected Journey Info */}
        <AnimatePresence>
          {selectedJourney && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10 transition-all duration-300 ${
                isSidebarOpen ? "lg:right-[25rem]" : "right-4"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {selectedJourney.title}
                  </h3>
                  {selectedJourney.description && (
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {selectedJourney.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{selectedJourney.user.username}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(selectedJourney.createdAt)}</span>
                    </div>
                    {selectedJourney.days && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {selectedJourney.days.reduce(
                            (total, day) => total + (day.places?.length || 0),
                            0
                          )}{" "}
                          places
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleJourneyModalOpen(selectedJourney)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={handleShowAllJourneys}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: 384, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 384, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-20 flex flex-col"
          >
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-200">
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
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors lg:hidden"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Radius Controls */}
              {coordinates && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-gray-600">Radius:</span>
                  <div className="flex gap-1">
                    {[10, 25, 50, 100].map((radius) => (
                      <button
                        key={radius}
                        onClick={() => handleRadiusChange(radius)}
                        disabled={journeysLoading}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                          currentRadius === radius
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        } disabled:opacity-50`}
                      >
                        {radius}km
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Nearby Journeys List */}
            <div className="flex-1 overflow-y-auto">
              {journeysLoading ? (
                <div className="p-6 text-center">
                  <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-600">Loading nearby journeys...</p>
                </div>
              ) : filteredJourneys.length === 0 ? (
                <div className="p-6 text-center">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {!coordinates && locationError
                      ? "Using default location"
                      : !coordinates
                      ? "Location access required"
                      : "No nearby journeys"}
                  </h3>
                  <p className="text-gray-600">
                    {!coordinates && locationError
                      ? "Location access was denied. Showing journeys from Ahmedabad, Gujarat."
                      : !coordinates
                      ? "Please allow location access to find journeys near you"
                      : `No journeys found within ${currentRadius}km of your location`}
                  </p>
                  {!coordinates && !locationError && (
                    <button
                      onClick={getCurrentLocation}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                    >
                      <Navigation className="w-4 h-4" />
                      Get Location
                    </button>
                  )}
                  {!coordinates && locationError && (
                    <div className="mt-4 space-y-2">
                      <button
                        onClick={getCurrentLocation}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                      >
                        <Navigation className="w-4 h-4" />
                        Try Again
                      </button>
                      <p className="text-xs text-gray-500">
                        Or continue with default location
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {filteredJourneys.map((journey, index) => {
                    const getJourneyLocation = () => {
                      // Handle both old journey structure and new nearby journey structure
                      if (journey.location) {
                        return journey.location;
                      }
                      if (journey.days && journey.days.length > 0) {
                        const firstDay = journey.days[0];
                        if (firstDay.places && firstDay.places.length > 0) {
                          const location = firstDay.places[0].location;
                          const parts = location.split(",");
                          if (parts.length >= 2) {
                            return parts[parts.length - 1].trim();
                          }
                          return location;
                        }
                      }
                      return "Unknown location";
                    };

                    const getJourneyCategory = () => {
                      // Handle category from nearby journeys API or fallback to days analysis
                      if (journey.category) {
                        return journey.category;
                      }
                      if (journey.days && journey.days.length > 0) {
                        for (const day of journey.days) {
                          if (day.places && day.places.length > 0) {
                            const categories = day.places.map((place) =>
                              place.type.toLowerCase()
                            );
                            if (categories.includes("activity"))
                              return "Amusement & Theme Parks";
                            if (categories.includes("stay"))
                              return "Hotels & Resorts";
                            if (categories.includes("food"))
                              return "Restaurants & Cafes";
                            if (categories.includes("transport"))
                              return "Transportation";
                          }
                        }
                      }
                      return "Travel Experience";
                    };

                    const getDistance = () => {
                      if (journey.distance !== undefined) {
                        return `${journey.distance.toFixed(1)}km away`;
                      }
                      return null;
                    };

                    const gradients = [
                      "from-purple-400 via-pink-400 to-blue-400",
                      "from-blue-400 via-purple-400 to-pink-400",
                      "from-pink-400 via-purple-400 to-indigo-400",
                      "from-indigo-400 via-blue-400 to-purple-400",
                      "from-purple-500 via-blue-400 to-indigo-400",
                      "from-blue-500 via-indigo-400 to-purple-400",
                    ];

                    const gradient = gradients[index % gradients.length];

                    return (
                      <motion.div
                        key={journey.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleJourneyClick(journey)}
                        onDoubleClick={() => handleJourneyModalOpen(journey)}
                        className={`bg-white rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md border ${
                          selectedJourney?.id === journey.id
                            ? "border-blue-500 shadow-md"
                            : "border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3 p-3">
                          {/* Journey Image/Gradient */}
                          <div
                            className={`w-16 h-16 rounded-lg bg-gradient-to-br ${gradient} flex-shrink-0 flex items-center justify-center`}
                          >
                            <div className="text-white text-lg font-semibold">
                              {journey.title.charAt(0).toUpperCase()}
                            </div>
                          </div>

                          {/* Journey Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                              {journey.title}
                            </h3>
                            <p className="text-xs text-gray-500 mb-1">
                              {getJourneyCategory()}
                            </p>
                            {/* Journey stats and distance */}
                            <div className="text-xs text-gray-400 space-y-1">
                              {getDistance() && <div>{getDistance()}</div>}
                              {journey.days && journey.days.length > 0 && (
                                <div>
                                  {journey.days.reduce(
                                    (total, day) =>
                                      total + (day.places?.length || 0),
                                    0
                                  )}{" "}
                                  places •{journey.days.length} days
                                </div>
                              )}
                              {journey.author && (
                                <div>
                                  by{" "}
                                  {journey.author.username ||
                                    journey.user?.username}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
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
