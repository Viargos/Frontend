'use client';

import * as motion from 'framer-motion/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type JourneyListHeaderProps = {
  onCreateJourney?: () => void;
  showFilters?: boolean;
  showSearch?: boolean;
};

export const JourneyListHeader = (props: JourneyListHeaderProps) => {
  const { onCreateJourney, showFilters = true, showSearch = true } = props;
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [sortBy, setSortBy] = useState<'updatedAt' | 'createdAt' | 'title'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const router = useRouter();

  const handleCreateJourney = () => {
    router.push('/create-journey');
    onCreateJourney?.();
  };

  const handleSortChange = (nextSortBy: 'updatedAt' | 'createdAt' | 'title') => {
    setSortOrder(sortBy === nextSortBy && sortOrder === 'desc' ? 'asc' : 'desc');
    setSortBy(nextSortBy);
    setShowFilterDropdown(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-2 text-3xl font-bold text-gray-900"
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
            className="flex items-center rounded-lg bg-green-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-green-700"
            type="button"
          >
            <span className="mr-2 text-base leading-none" aria-hidden="true">+</span>
            Create Journey
          </motion.button>
        </motion.div>
      </div>

      {showSearch || showFilters
        ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row"
            >
              {showSearch
                ? (
                    <div className="relative flex-1">
                      <span className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400" aria-hidden="true">⌕</span>
                      <input
                        type="text"
                        placeholder="Search journeys..."
                        value={searchQuery}
                        onChange={event => setSearchQuery(event.target.value)}
                        className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 transition-colors outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500"
                      />
                      {searchQuery
                        ? (
                            <button
                              onClick={() => setSearchQuery('')}
                              className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                              type="button"
                            >
                              ×
                            </button>
                          )
                        : null}
                    </div>
                  )
                : null}

              {showFilters
                ? (
                    <div className="relative">
                      <button
                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                        className="flex min-w-[120px] items-center justify-center rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50"
                        type="button"
                      >
                        <span className="mr-2 text-sm leading-none" aria-hidden="true">≡</span>
                        Sort & Filter
                      </button>

                      {showFilterDropdown
                        ? (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute right-0 z-10 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg"
                            >
                              <div className="p-3">
                                <div className="mb-2 text-sm font-medium text-gray-700">Sort by</div>
                                <div className="space-y-1">
                                  {[
                                    { value: 'updatedAt', label: 'Last Modified' },
                                    { value: 'createdAt', label: 'Created Date' },
                                    { value: 'title', label: 'Title' },
                                  ].map(option => (
                                    <button
                                      key={option.value}
                                      onClick={() => handleSortChange(option.value as 'updatedAt' | 'createdAt' | 'title')}
                                      className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                                        sortBy === option.value
                                          ? 'bg-green-50 text-green-700'
                                          : 'text-gray-700 hover:bg-gray-50'
                                      }`}
                                      type="button"
                                    >
                                      {option.label}
                                      {sortBy === option.value
                                        ? (
                                            <span className="ml-1">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                                          )
                                        : null}
                                    </button>
                                  ))}
                                </div>
                                <div className="mt-3 border-t border-gray-200 pt-3">
                                  <button
                                    onClick={() => {
                                      setSortBy('updatedAt');
                                      setSortOrder('desc');
                                      setShowFilterDropdown(false);
                                    }}
                                    className="text-sm text-red-600 transition-colors hover:text-red-700"
                                    type="button"
                                  >
                                    Reset Filters
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )
                        : null}
                    </div>
                  )
                : null}
            </motion.div>
          )
        : null}
    </motion.div>
  );
};
