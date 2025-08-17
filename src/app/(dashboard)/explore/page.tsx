"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, User, ChevronRight, X, Search } from 'lucide-react';
import apiClient from '@/lib/api.legacy';
import ExploreMap from '@/components/maps/ExploreMap';
import { Journey } from '@/types/journey.types';
import { PlaceType } from '@/types/journey.types';
import { PageLoading } from '@/components/common/Loading';

export default function ExplorePage() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | PlaceType>('all');

  // Function to fetch journeys directly from API
  const fetchJourneys = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📡 ExplorePage: Calling apiClient.getMyJourneys() directly');
      const response = await apiClient.getMyJourneys();
      
      console.log('📦 ExplorePage: Raw API response:', response);
      
      if (response && response.data) {
        console.log('✅ ExplorePage: Setting journeys data:', response.data);
        setJourneys(response.data);
      } else {
        console.log('⚠️ ExplorePage: No data in response');
        setJourneys([]);
      }
    } catch (err: any) {
      console.log('💥 ExplorePage: Error fetching journeys:', err);
      setError(err.message || 'Failed to load journeys');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch journeys on component mount
  useEffect(() => {
    fetchJourneys();
  }, []);

  // Filter journeys based on search query
  const filteredJourneys = journeys.filter(journey =>
    journey.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    journey.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJourneyClick = (journey: Journey) => {
    setSelectedJourney(journey);
  };

  const handleShowAllJourneys = () => {
    setSelectedJourney(null);
  };

  const handleLocationClick = (location: any) => {
    if (location.journey && !selectedJourney) {
      handleJourneyClick(location.journey);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPlaceTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'stay':
        return '🏨';
      case 'activity':
        return '🎯';
      case 'food':
        return '🍽️';
      case 'transport':
        return '🚗';
      case 'note':
        return '📝';
      default:
        return '📍';
    }
  };

  if (isLoading) {
    return <PageLoading text="Loading journeys..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <MapPin className="w-12 h-12 mx-auto mb-2" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Journeys</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchJourneys}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50 relative overflow-hidden">
      {/* Map Container */}
      <div className={`flex-1 relative transition-all duration-300 ${isSidebarOpen ? 'lg:mr-96' : 'mr-0'}`}>
        <ExploreMap
          journeys={journeys}
          selectedJourney={selectedJourney}
          onLocationClick={handleLocationClick}
        />
        
        {/* Map Controls */}
        <div className="absolute top-4 left-4 z-10">
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
        </div>

        {/* Selected Journey Info */}
        <AnimatePresence>
          {selectedJourney && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10 transition-all duration-300 ${
                isSidebarOpen ? 'lg:right-[25rem]' : 'right-4'
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
                          {selectedJourney.days.reduce((total, day) => total + (day.places?.length || 0), 0)} places
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleShowAllJourneys}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
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
                <h2 className="text-xl font-semibold text-gray-900">
                  My Journeys
                </h2>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors lg:hidden"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search journeys..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{filteredJourneys.length} journeys found</span>
                {selectedJourney && (
                  <button
                    onClick={handleShowAllJourneys}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Show all
                  </button>
                )}
              </div>
            </div>

            {/* Journey List */}
            <div className="flex-1 overflow-y-auto">
              {filteredJourneys.length === 0 ? (
                <div className="p-6 text-center">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No journeys found</h3>
                  <p className="text-gray-600">
                    {searchQuery ? 'Try adjusting your search terms.' : 'Start creating your first journey!'}
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {filteredJourneys.map((journey, index) => (
                    <motion.div
                      key={journey.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleJourneyClick(journey)}
                      className={`bg-gray-50 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:bg-gray-100 border-2 ${
                        selectedJourney?.id === journey.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-transparent'
                      }`}
                    >
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                        {journey.title}
                      </h3>
                      
                      {journey.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {journey.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>By {journey.user.username}</span>
                        <span>{formatDate(journey.createdAt)}</span>
                      </div>

                      {/* Places Preview */}
                      {journey.days && journey.days.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-medium text-gray-700">
                            <span>Places ({journey.days.reduce((total, day) => total + (day.places?.length || 0), 0)})</span>
                            <span>{journey.days.length} days</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {journey.days.slice(0, 2).map((day) =>
                              day.places?.slice(0, 3).map((place) => (
                                <span
                                  key={place.id}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs text-gray-600"
                                >
                                  <span>{getPlaceTypeIcon(place.type)}</span>
                                  <span className="truncate max-w-20">{place.name}</span>
                                </span>
                              ))
                            )}
                            {journey.days.reduce((total, day) => total + (day.places?.length || 0), 0) > 6 && (
                              <span className="text-xs text-gray-400">
                                +{journey.days.reduce((total, day) => total + (day.places?.length || 0), 0) - 6} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
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
    </div>
  );
}
