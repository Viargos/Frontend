'use client';

import React, { useState } from 'react';
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
  isVisible,
  onToggleVisibility,
}: JourneyFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['location', 'time'])
  );

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

  const toggleArrayFilter = (key: keyof JourneyFilterState, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];

    updateFilter(key, newArray);
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
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Icon className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-gray-900">{title}</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
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
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onReset}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={onToggleVisibility}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Radius: {filters.radius}km
              </label>
              <input
                type="range"
                min="1"
                max="500"
                value={filters.radius}
                onChange={e => updateFilter('radius', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1km</span>
                <span>500km</span>
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Time Filters */}
        <FilterSection title="Time" icon={Calendar} sectionKey="time">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Created Within
              </label>
              <select
                value={filters.createdWithin}
                onChange={e => updateFilter('createdWithin', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="year">Past Year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Journey Date Range
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={filters.dateRange.from}
                  onChange={e =>
                    updateNestedFilter('dateRange', 'from', e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={filters.dateRange.to}
                  onChange={e =>
                    updateNestedFilter('dateRange', 'to', e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </FilterSection>
      </div>
    </div>
  );
}
