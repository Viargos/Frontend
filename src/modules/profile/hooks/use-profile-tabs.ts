'use client';

import { useState } from 'react';
import { ProfileTab } from '@/modules/profile/enums/profile-tab.enum';

export function useProfileTabs() {
  const [activeTab, setActiveTab] = useState<ProfileTab>(ProfileTab.JOURNEY);

  return {
    activeTab,
    setActiveTab,
  };
}
