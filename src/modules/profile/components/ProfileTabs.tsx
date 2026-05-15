'use client';

import type { ProfileTab } from '@/modules/profile/enums/profile-tab.enum';
import * as motion from 'framer-motion/client';
import { PROFILE_TABS } from '@/modules/profile/constants/profile.constants';

type ProfileTabsProps = {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
};

export const ProfileTabs = (props: ProfileTabsProps) => {
  const { activeTab, onTabChange } = props;

  return (
    <motion.div
      className="profile-tabs flex w-full items-center gap-8 border-b px-4 sm:px-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {PROFILE_TABS.map((tab, index) => (
        <motion.button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`profile-tab-button relative border-b-2 px-1 pb-3 font-medium transition-colors ${
            activeTab === tab.id
              ? 'profile-tab-button-active border-transparent'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 * index }}
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
          type="button"
        >
          {tab.label}

          {activeTab === tab.id
            ? (
                <motion.div
                  className="profile-tab-indicator absolute right-0 bottom-0 left-0 h-0.5 rounded-full"
                  layoutId="activeTab"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )
            : null}
        </motion.button>
      ))}
    </motion.div>
  );
};
