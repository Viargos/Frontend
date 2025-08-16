"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter } from 'lucide-react';
import { useJourneyStore } from '@/store/journey.store';
import NewJourneyModal from '@/components/journey/NewJourneyModal';

interface JourneysHeaderProps {
  onCreateJourney?: () => void;
  showSearch?: boolean;
  showFilters?: boolean;
}

export default function JourneysHeader({
  onCreateJourney,
  showSearch = true,
  showFilters = true,
}: JourneysHeaderProps) {
  const [showNewJourneyModal, setShowNewJourneyModal] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  const {
    searchQuery,
    filters,
    searchJourneys,
    setSearchQuery,
    setFilters,
    resetFilters,
    createJourney,
  } = useJourneyStore();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchJourneys(query);
    }
  };

  const handleCreateJourney = () => {
    if (onCreateJourney) {
      onCreateJourney();
    } else {
      setShowNewJourneyModal(true);
    }
  };

  const handleNewJourneySubmit = async (journeyData: {
    name: string;
    journeyDate: string;
    location: string;
    locationData?: any;
  }) => {
    const newJourney = await createJourney({
      title: journeyData.name,
      description: `Journey to ${journeyData.location} on ${journeyData.journeyDate}`,
    });

    if (newJourney) {
      setShowNewJourneyModal(false);
    }
  };

  const handleSortChange = (sortBy: string) => {
    setFilters({ 
      sortBy: sortBy as any,
      sortOrder: filters.sortBy === sortBy && filters.sortOrder === 'desc' ? 'asc' : 'desc'
    });
    setShowFilterDropdown(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Title and Description */}
        <div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl font-bold text-gray-900 mb-2"
          >
            My Journeys
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-gray-600"
          >
            Create, manage and share your travel adventures
          </motion.p>
        </div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateJourney}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Journey
          </motion.button>
        </motion.div>
      </div>

      {/* Search and Filter Bar */}
      {(showSearch || showFilters) && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray-100"
        >
          {/* Search Input */}
          {showSearch && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search journeys..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearch('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
          )}

          {/* Filter Dropdown */}
          {showFilters && (
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-w-[120px] justify-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                Sort & Filter
              </button>

              {showFilterDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                >
                  <div className="p-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">Sort by</div>
                    <div className="space-y-1">
                      {[
                        { value: 'updatedAt', label: 'Last Modified' },
                        { value: 'createdAt', label: 'Created Date' },
                        { value: 'title', label: 'Title' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleSortChange(option.value)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${ 
                            filters.sortBy === option.value
                              ? 'bg-green-50 text-green-700'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          {option.label}
                          {filters.sortBy === option.value && (
                            <span className="ml-1">
                              {filters.sortOrder === 'desc' ? '↓' : '↑'}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 mt-3 pt-3">
                      <button
                        onClick={() => {
                          resetFilters();
                          setShowFilterDropdown(false);
                        }}
                        className="text-sm text-red-600 hover:text-red-700 transition-colors"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* New Journey Modal */}
      <NewJourneyModal
        isOpen={showNewJourneyModal}
        onClose={() => setShowNewJourneyModal(false)}
        onSubmit={handleNewJourneySubmit}
      />
    </motion.div>
  );
}
