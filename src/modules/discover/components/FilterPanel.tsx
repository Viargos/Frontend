'use client';

import * as motion from 'framer-motion/client';
import { useState } from 'react';
import { DatePickerField } from '@/modules/common/components';
import { ExploreIcon, XIcon } from '@/modules/common/icons';
import { DISCOVER_MAX_RADIUS_KM, DISCOVER_MIN_RADIUS_KM } from '@/modules/discover/constants/discover.constants';

export type JourneyFilterState = {
  createdWithin: 'all' | 'month' | 'week' | 'year';
  dateRange: {
    from: string;
    to: string;
  };
  radius: number;
  tags: string[];
};

type FilterPanelProps = {
  disableMotion?: boolean;
  filters: JourneyFilterState;
  isVisible: boolean;
  onFiltersChange: (filters: JourneyFilterState) => void;
  onReset: () => void;
  onToggleVisibility: () => void;
};

type FilterSectionProps = {
  children: React.ReactNode;
  disableMotion: boolean;
  icon: string;
  isExpanded: boolean;
  onToggle: () => void;
  title: string;
};

const FilterSection = (props: FilterSectionProps) => {
  const {
    children,
    disableMotion,
    icon,
    isExpanded,
    onToggle,
    title,
  } = props;

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        className="group flex w-full items-center justify-between p-4 transition-colors hover:bg-[#160E53]/5"
        onClick={onToggle}
        type="button"
      >
        <div className="flex items-center space-x-3">
          <div
            className={`rounded-lg p-1.5 transition-colors ${
              isExpanded
                ? 'bg-[#160E53]'
                : 'bg-gray-100 group-hover:bg-[#160E53]/20'
            }`}
          >
            <span
              className={`text-sm transition-colors ${
                isExpanded
                  ? 'text-white'
                  : 'text-gray-600 group-hover:text-[#160E53]'
              }`}
              aria-hidden="true"
            >
              {icon}
            </span>
          </div>
          <span className="font-medium text-gray-900 transition-colors group-hover:text-[#160E53]">
            {title}
          </span>
        </div>
        <span
          className={`text-sm ${isExpanded ? 'text-[#160E53]' : 'text-gray-400 group-hover:text-[#160E53]'}`}
          aria-hidden="true"
        >
          {isExpanded ? '▴' : '▾'}
        </span>
      </button>

      {isExpanded
        ? (
            <motion.div
              animate={{ height: 'auto', opacity: 1 }}
              className="overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              transition={disableMotion ? { duration: 0 } : { duration: 0.2 }}
            >
              <div className="space-y-3 p-4 pt-0">{children}</div>
            </motion.div>
          )
        : null}
    </div>
  );
};

export const FilterPanel = (props: FilterPanelProps) => {
  const {
    disableMotion = false,
    filters,
    isVisible,
    onFiltersChange,
    onReset,
    onToggleVisibility,
  } = props;

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(['location', 'time']),
  );

  if (!isVisible) {
    return null;
  }

  const toggleSection = (section: string) => {
    const nextExpanded = new Set(expandedSections);

    if (nextExpanded.has(section)) {
      nextExpanded.delete(section);
    } else {
      nextExpanded.add(section);
    }

    setExpandedSections(nextExpanded);
  };

  const updateFilters = (nextFilters: JourneyFilterState) => {
    onFiltersChange(nextFilters);
  };

  return (
    <div className="border-b border-gray-200 bg-white" data-parity="discover-filters">
      <div className="border-b border-gray-200 bg-linear-to-r from-[#160E53]/5 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="rounded-lg bg-[#160E53] p-1.5">
              <ExploreIcon aria-hidden="true" className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-semibold text-[#160E53]">Filters</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="rounded-md px-3 py-1.5 text-sm font-medium text-[#160E53] transition-colors hover:bg-[#160E53]/10 hover:text-[#001456]"
              onClick={onReset}
              type="button"
            >
              Reset
            </button>
            <button
              className="rounded-md p-1.5 transition-colors hover:bg-gray-100"
              onClick={onToggleVisibility}
              type="button"
            >
              <XIcon aria-hidden="true" className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        <FilterSection
          disableMotion={disableMotion}
          icon=""
          isExpanded={expandedSections.has('location')}
          onToggle={() => toggleSection('location')}
          title="Location"
        >
          <div className="space-y-3">
            <div>
              <label className="mb-3 block text-sm font-semibold text-[#160E53]">
                Search Radius:
                {' '}
                <span className="rounded-md bg-[#160E53] px-2 py-0.5 text-white">
                  {filters.radius}
                  km
                </span>
              </label>
              <input
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-[#160E53]"
                max={DISCOVER_MAX_RADIUS_KM}
                min={DISCOVER_MIN_RADIUS_KM}
                step={50}
                type="range"
                value={filters.radius}
                onChange={event => updateFilters({
                  ...filters,
                  radius: Number(event.target.value),
                })}
              />
              <div className="mt-2 flex justify-between text-xs text-black">
                <span className="font-semibold">
                  {DISCOVER_MIN_RADIUS_KM}
                  km local
                </span>
                <span className="font-semibold">
                  {DISCOVER_MAX_RADIUS_KM}
                  km regional
                </span>
              </div>
            </div>
          </div>
        </FilterSection>

        <FilterSection
          disableMotion={disableMotion}
          icon=""
          isExpanded={expandedSections.has('time')}
          onToggle={() => toggleSection('time')}
          title="Time"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#160E53]" htmlFor="discover-created-within">
                Created Within
              </label>
              <select
                id="discover-created-within"
                className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-black transition-colors hover:border-[#160E53]/50 focus:border-[#160E53] focus:ring-2 focus:ring-[#160E53] focus:outline-none"
                value={filters.createdWithin}
                onChange={event => updateFilters({
                  ...filters,
                  createdWithin: event.target.value as JourneyFilterState['createdWithin'],
                })}
              >
                <option value="all">All Time</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="year">Past Year</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#160E53]" htmlFor="discover-date-from">
                Journey Date Range
              </label>
              <div className="space-y-2">
                <DatePickerField
                  className="rounded-lg"
                  description="Choose the first date travelers should be included in the results."
                  id="discover-date-from"
                  max={filters.dateRange.to || undefined}
                  onChange={nextValue => updateFilters({
                    ...filters,
                    dateRange: {
                      ...filters.dateRange,
                      from: nextValue,
                    },
                  })}
                  placeholder="Select start date"
                  title="Filter from date"
                  value={filters.dateRange.from}
                />
                <DatePickerField
                  className="rounded-lg"
                  description="Choose the latest journey date travelers should be included in the results."
                  id="discover-date-to"
                  min={filters.dateRange.from || undefined}
                  onChange={nextValue => updateFilters({
                    ...filters,
                    dateRange: {
                      ...filters.dateRange,
                      to: nextValue,
                    },
                  })}
                  placeholder="Select end date"
                  title="Filter to date"
                  value={filters.dateRange.to}
                />
              </div>
            </div>
          </div>
        </FilterSection>
      </div>
    </div>
  );
};
