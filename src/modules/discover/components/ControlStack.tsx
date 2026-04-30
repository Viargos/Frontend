'use client';

import * as motion from 'framer-motion/client';
import { ChevronRightIcon, ExploreIcon, GlobeIcon, RefreshCwIcon } from '@/modules/common/icons';

type ControlStackProps = {
  autoSearch: boolean;
  isLoadingLocation: boolean;
  isSidebarOpen: boolean;
  onRefreshLocation: () => void;
  onSearchGlobal: () => void;
  onToggleAutoSearch: () => void;
  onToggleSidebar: () => void;
};

export const ControlStack = (props: ControlStackProps) => {
  const {
    autoSearch,
    isLoadingLocation,
    isSidebarOpen,
    onRefreshLocation,
    onSearchGlobal,
    onToggleAutoSearch,
    onToggleSidebar,
  } = props;

  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
      <motion.button
        animate={{ opacity: 1, x: 0 }}
        className="rounded-lg bg-white p-3 shadow-lg transition-all duration-200 hover:shadow-xl"
        initial={{ opacity: 0, x: 20 }}
        onClick={onToggleSidebar}
        type="button"
      >
        <motion.div
          animate={{ rotate: isSidebarOpen ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronRightIcon aria-hidden="true" className="h-5 w-5 text-gray-600" />
        </motion.div>
      </motion.button>

      <motion.button
        animate={{ opacity: 1, x: 0 }}
        className="rounded-lg bg-white p-3 shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50"
        initial={{ opacity: 0, x: 20 }}
        transition={{ delay: 0.1 }}
        disabled={isLoadingLocation}
        onClick={onRefreshLocation}
        title="Refresh location"
        type="button"
      >
        <RefreshCwIcon aria-hidden="true" className={`h-5 w-5 text-gray-600 ${isLoadingLocation ? 'animate-spin' : ''}`} />
      </motion.button>

      <motion.button
        animate={{ opacity: 1, x: 0 }}
        className={`rounded-lg p-3 shadow-lg transition-all duration-200 hover:shadow-xl ${autoSearch ? 'bg-[#160E53]' : 'bg-white'}`}
        initial={{ opacity: 0, x: 20 }}
        transition={{ delay: 0.2 }}
        onClick={onToggleAutoSearch}
        title={autoSearch ? 'Auto-search: ON' : 'Auto-search: OFF'}
        type="button"
      >
        <ExploreIcon aria-hidden="true" className={`h-5 w-5 ${autoSearch ? 'text-white' : 'text-gray-600'}`} />
      </motion.button>

      <motion.button
        animate={{ opacity: 1, x: 0 }}
        className="rounded-lg bg-green-600 p-3 text-white shadow-lg transition-all duration-200 hover:shadow-xl"
        initial={{ opacity: 0, x: 20 }}
        transition={{ delay: 0.3 }}
        onClick={onSearchGlobal}
        title="Search Worldwide"
        type="button"
      >
        <GlobeIcon aria-hidden="true" className="h-5 w-5" />
      </motion.button>
    </div>
  );
};
