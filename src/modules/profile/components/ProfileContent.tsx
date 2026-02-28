'use client';

import type { UserProfile } from '@/modules/profile/types/profile.types';
import * as motion from 'framer-motion/client';
import { ProfileHeader } from '@/modules/profile/components/ProfileHeader';
import { ProfileJourneysTab } from '@/modules/profile/components/ProfileJourneysTab';
import { ProfileMapPanel } from '@/modules/profile/components/ProfileMapPanel';
import { ProfilePostsTab } from '@/modules/profile/components/ProfilePostsTab';
import { ProfileTabs } from '@/modules/profile/components/ProfileTabs';
import { ProfileTab } from '@/modules/profile/enums/profile-tab.enum';
import { useProfileTabs } from '@/modules/profile/hooks/use-profile-tabs';

type ProfileContentProps = {
  heading?: string;
  isOwnProfile?: boolean;
  profile: UserProfile;
};

export const ProfileContent = (props: ProfileContentProps) => {
  const { heading, isOwnProfile = true, profile } = props;
  const { activeTab, setActiveTab } = useProfileTabs();

  return (
    <motion.div
      className="flex w-full flex-1 flex-col items-start gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <ProfileHeader heading={heading} isOwnProfile={isOwnProfile} profile={profile} />

      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === ProfileTab.JOURNEY
        ? (
            <ProfileJourneysTab
              isOwnProfile={isOwnProfile}
              journeys={profile.recentJourneys}
              ownerName={profile.user.username}
            />
          )
        : null}

      {activeTab === ProfileTab.POST
        ? (
            <ProfilePostsTab
              isOwnProfile={isOwnProfile}
              ownerName={profile.user.username}
              posts={profile.recentPosts}
            />
          )
        : null}

      {activeTab === ProfileTab.MAP
        ? (
            <ProfileMapPanel
              isOwnProfile={isOwnProfile}
              journeys={profile.recentJourneys}
              ownerName={profile.user.username}
            />
          )
        : null}
    </motion.div>
  );
};
