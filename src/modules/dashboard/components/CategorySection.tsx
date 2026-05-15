import type { DashboardProfileRecommendation } from '@/modules/dashboard/types/dashboard.types';
import { ProfileItem } from './ProfileItem';
import { SectionHeader } from './SectionHeader';

type CategoryGroup = {
  label: string;
  profiles: DashboardProfileRecommendation[];
};

type CategorySectionProps = {
  groups: CategoryGroup[];
  onProfileChange?: (
    profileId: string,
    nextState: { followersCount: number; isFollowing: boolean },
  ) => void;
};

export const CategorySection = (props: CategorySectionProps) => {
  const { groups, onProfileChange } = props;

  if (groups.length === 0) {
    return null;
  }

  return (
    <section className="dashboard-right-section rounded-[24px] border px-2 py-3">
      <SectionHeader
        description="Browse a few focused creator clusters."
        title="By category"
      />

      <div className="mt-3 space-y-4">
        {groups.map(group => (
          <div key={group.label}>
            <p className="dashboard-category-label px-3 text-[11px] font-semibold tracking-[0.14em] uppercase">
              {group.label}
            </p>
            <div className="mt-1.5 space-y-1">
              {group.profiles.map(profile => (
                <ProfileItem
                  key={profile.id}
                  onProfileChange={onProfileChange}
                  profile={profile}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
