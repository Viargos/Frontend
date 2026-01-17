'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarIcon, ChevronDownIcon, CheckIcon } from '@/components/icons';

interface YearFilterProps {
  availableYears: number[];
  selectedYear: number | null;
  onYearChange: (year: number | null) => void;
  /** Number of years to show in the past (default: 10) */
  yearsRange?: number;
}

export default function YearFilter({
  availableYears,
  selectedYear,
  onYearChange,
  yearsRange = 10,
}: YearFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Generate a full range of years from current year going back
  const allYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let i = 0; i < yearsRange; i++) {
      years.push(currentYear - i);
    }
    return years;
  }, [yearsRange]);

  // Set of years that have journeys (for highlighting)
  const yearsWithJourneys = useMemo(() => new Set(availableYears), [availableYears]);

  const handleYearSelect = (year: number | null) => {
    onYearChange(year);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <CalendarIcon className="w-4 h-4 text-gray-500" size={16} />
        <span className="text-sm font-medium text-gray-700">
          {selectedYear ? selectedYear : 'All Years'}
        </span>
        <ChevronDownIcon
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          size={16}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="py-2">
                {/* All Years Option */}
                <motion.button
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    selectedYear === null
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => handleYearSelect(null)}
                  whileHover={{
                    backgroundColor:
                      selectedYear === null ? undefined : '#f9fafb',
                  }}
                >
                  All Years
                  {selectedYear === null && (
                    <CheckIcon className="inline-block w-4 h-4 ml-2" size={16} />
                  )}
                </motion.button>

                {/* Divider */}
                <div className="border-t border-gray-100 my-1" />

                {/* Year Options - Show all years in range */}
                {allYears.map(year => {
                  const hasJourneys = yearsWithJourneys.has(year);
                  return (
                    <motion.button
                      key={year}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${
                        selectedYear === year
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : hasJourneys
                          ? 'text-gray-900 hover:bg-gray-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      onClick={() => handleYearSelect(year)}
                      whileHover={{
                        backgroundColor:
                          selectedYear === year ? undefined : '#f9fafb',
                      }}
                    >
                      <span className="flex items-center gap-2">
                        {year}
                        {hasJourneys && (
                          <span className="w-2 h-2 rounded-full bg-[#001A6E]" title="Has journeys" />
                        )}
                      </span>
                      {selectedYear === year && (
                        <CheckIcon className="w-4 h-4" size={16} />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
