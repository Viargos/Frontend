'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  X,
} from 'lucide-react';

export interface JourneyFilterState {
  // Location filters
  radius: number;

  // Time filters
  dateRange: {
    from: string;
    to: string;
  };
  createdWithin: 'all' | 'week' | 'month' | 'year';

  // Content filters
  tags: string[];
}

interface JourneyFiltersProps {
  filters: JourneyFilterState;
  onFiltersChange: (filters: JourneyFilterState) => void;
  onReset: () => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export default function JourneyFilters({
  filters,
  onFiltersChange,
  onReset,
  isVisible: _isVisible,
  onToggleVisibility,
}: JourneyFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['location', 'time'])
  );
  const [localRadius, setLocalRadius] = useState(filters.radius);
  const radiusTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local radius with filter radius when it changes externally
  useEffect(() => {
    setLocalRadius(filters.radius);
  }, [filters.radius]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (radiusTimerRef.current) {
        clearTimeout(radiusTimerRef.current);
      }
    };
  }, []);

  // Handle radius change with debounce
  const handleRadiusChange = (newRadius: number) => {
    // Update local state immediately for smooth UI
    setLocalRadius(newRadius);

    // Clear existing timer
    if (radiusTimerRef.current) {
      clearTimeout(radiusTimerRef.current);
    }

    // Set new timer to update actual filter (debounced)
    radiusTimerRef.current = setTimeout(() => {
      updateFilter('radius', newRadius);
    }, 800); // 800ms debounce - only fires after user stops dragging
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const updateFilter = (key: keyof JourneyFilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const updateNestedFilter = (
    parentKey: keyof JourneyFilterState,
    childKey: string,
    value: any
  ) => {
    onFiltersChange({
      ...filters,
      [parentKey]: {
        ...(filters[parentKey] as any),
        [childKey]: value,
      },
    });
  };

  const FilterSection = ({
    title,
    icon: Icon,
    sectionKey,
    children,
  }: {
    title: string;
    icon: React.ComponentType<any>;
    sectionKey: string;
    children: React.ReactNode;
  }) => {
    const isExpanded = expandedSections.has(sectionKey);

    return (
      <div className="border-b border-gray-200 last:border-b-0">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between p-4 hover:bg-[#001A6E]/5 transition-colors group"
        >
          <div className="flex items-center space-x-3">
            <div className={`p-1.5 rounded-lg transition-colors ${isExpanded ? 'bg-[#001A6E]' : 'bg-gray-100 group-hover:bg-[#001A6E]/20'}`}>
              <Icon className={`w-4 h-4 transition-colors ${isExpanded ? 'text-white' : 'text-gray-600 group-hover:text-[#001A6E]'}`} />
            </div>
            <span className="font-medium text-gray-900 group-hover:text-[#001A6E] transition-colors">{title}</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-[#001A6E]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[#001A6E] transition-colors" />
          )}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 space-y-3">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Filter Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-[#001A6E]/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-[#001A6E] rounded-lg">
              <Filter className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-[#001A6E]">Filters</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onReset}
              className="text-sm text-[#001A6E] hover:text-[#001456] font-medium transition-colors px-3 py-1.5 rounded-md hover:bg-[#001A6E]/10"
            >
              Reset
            </button>
            <button
              onClick={onToggleVisibility}
              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Sections */}
      <div className="max-h-96 overflow-y-auto">
        {/* Location Filters */}
        <FilterSection title="Location" icon={MapPin} sectionKey="location">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-[#001A6E] mb-3">
                Search Radius: <span className="text-white bg-[#001A6E] px-2 py-0.5 rounded-md">{localRadius}km</span>
              </label>
              <input
                type="range"
                min="10"
                max="10000"
                step="50"
                value={localRadius}
                onChange={e => handleRadiusChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#001A6E]"
                style={{
                  background: `linear-gradient(to right, #001A6E 0%, #001A6E ${(localRadius / 10000) * 100}%, #e5e7eb ${(localRadius / 10000) * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-black mt-2">
                <span className="font-semibold">10km (local)</span>
                <span className="font-semibold">10,000km (global)</span>
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Time Filters */}
        <FilterSection title="Time" icon={Calendar} sectionKey="time">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#001A6E] mb-2">
                Created Within
              </label>
              <select
                value={filters.createdWithin}
                onChange={e => updateFilter('createdWithin', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#001A6E] focus:border-[#001A6E] bg-white hover:border-[#001A6E]/50 transition-colors cursor-pointer"
              >
                <option value="all">All Time</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="year">Past Year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#001A6E] mb-2">
                Journey Date Range
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="date"
                    value={filters.dateRange.from}
                    onChange={e =>
                      updateNestedFilter('dateRange', 'from', e.target.value)
                    }
                    placeholder="From date"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#001A6E] focus:border-[#001A6E] hover:border-[#001A6E]/50 transition-colors"
                  />
                </div>
                <div className="relative">
                  <input
                    type="date"
                    value={filters.dateRange.to}
                    onChange={e =>
                      updateNestedFilter('dateRange', 'to', e.target.value)
                    }
                    placeholder="To date"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#001A6E] focus:border-[#001A6E] hover:border-[#001A6E]/50 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </FilterSection>
      </div>
    </div>
  );
}
