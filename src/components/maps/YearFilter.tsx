'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="text-sm font-medium text-gray-700">
          {selectedYear ? selectedYear : 'All Years'}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
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
                    <svg
                      className="inline-block w-4 h-4 ml-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
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
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
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
