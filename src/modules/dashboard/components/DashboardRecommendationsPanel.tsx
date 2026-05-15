'use client';

import type {
  DashboardJourneyRecommendation,
  DashboardProfileRecommendation,
} from '@/modules/dashboard/types/dashboard.types';
import { useMemo } from 'react';
import { Skeleton } from '@/modules/common/components/ui/skeleton';
import { useDashboardRecommendations } from '@/modules/dashboard/hooks';
import { CategorySection } from './CategorySection';
import { ExploreIcon, JourneyIcon } from './dashboard-icons';
import { JourneyItem } from './JourneyItem';
import { ProfileItem } from './ProfileItem';
import { RightPanelContainer } from './RightPanelContainer';
import { SectionHeader } from './SectionHeader';

type DashboardRecommendationsPanelProps = {
  initialJourneys: DashboardJourneyRecommendation[];
  initialProfiles: DashboardProfileRecommendation[];
};

function RecommendationRowSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/6 px-3 py-3">
      <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
      <div className="min-w-0 flex-1 space-y-2 pt-0.5">
        <Skeleton className="h-3.5 w-28 bg-white/10" />
        <Skeleton className="h-3 w-full max-w-[180px] bg-white/10" />
        <Skeleton className="h-3 w-20 bg-white/10" />
      </div>
      <Skeleton className="h-8 w-[78px] rounded-full bg-white/10" />
    </div>
  );
}

export const DashboardRecommendationsPanel = (props: DashboardRecommendationsPanelProps) => {
  const { initialJourneys, initialProfiles } = props;
  const {
    canShowMore,
    error,
    isLoadingMore,
    isRefreshing,
    loadMoreRecommendations,
    profiles,
    refreshRecommendations,
    updateProfile,
  } = useDashboardRecommendations({ initialProfiles });

  const categoryGroups = useMemo(() => {
    const groups = new Map<string, DashboardProfileRecommendation[]>();

    for (const profile of profiles) {
      if (!profile.category) {
        continue;
      }

      const categoryProfiles = groups.get(profile.category) ?? [];
      if (categoryProfiles.length < 2) {
        categoryProfiles.push(profile);
        groups.set(profile.category, categoryProfiles);
      }
    }

    return Array.from(groups.entries())
      .slice(0, 3)
      .map(([label, categoryProfiles]) => ({ label, profiles: categoryProfiles }))
      .filter(group => group.profiles.length > 0);
  }, [profiles]);

  return (
    <div className="space-y-4">
      <RightPanelContainer contentClassName="xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto">
        <section className="dashboard-right-section rounded-[24px] border px-2 py-3">
          <SectionHeader
            actionLabel={isRefreshing ? 'Refreshing' : 'Refresh'}
            description="Popular profiles worth following without pulling focus from your feed."
            disabled={isRefreshing}
            icon={<ExploreIcon className="h-4 w-4" />}
            onAction={() => void refreshRecommendations()}
            title="Explore Creators"
          />

          {isRefreshing && profiles.length === 0
            ? (
                <div className="mt-3 space-y-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <RecommendationRowSkeleton key={`recommendation-skeleton-${index + 1}`} />
                  ))}
                </div>
              )
            : profiles.length > 0
              ? (
                  <div className="mt-3 space-y-1">
                    {profiles.map(profile => (
                      <ProfileItem
                        key={profile.id}
                        onProfileChange={updateProfile}
                        profile={profile}
                      />
                    ))}
                  </div>
                )
              : (
                  <div className="dashboard-right-empty-state rounded-2xl border border-dashed px-4 py-6 text-center">
                    <p className="dashboard-section-title text-sm font-medium">No suggestions right now</p>
                    <p className="dashboard-section-description mt-1 text-xs leading-5">
                      Try refreshing to pull a fresh set of profiles.
                    </p>
                  </div>
                )}

          {error
            ? <p className="mt-3 px-3 text-xs text-rose-400">{error}</p>
            : null}

          {canShowMore && profiles.length > 0
            ? (
                <div className="mt-3 px-2">
                  <button
                    className="dashboard-right-button w-full rounded-2xl border px-3 py-2.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isLoadingMore}
                    onClick={() => void loadMoreRecommendations()}
                    type="button"
                  >
                    {isLoadingMore ? 'Loading more' : 'Show more'}
                  </button>
                </div>
              )
            : null}

          {isLoadingMore
            ? (
                <div className="mt-2 space-y-1">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <RecommendationRowSkeleton key={`recommendation-more-skeleton-${index + 1}`} />
                  ))}
                </div>
              )
            : null}
        </section>

        {categoryGroups.length >= 2
          ? (
              <div className="mt-4">
                <CategorySection
                  groups={categoryGroups}
                  onProfileChange={updateProfile}
                />
              </div>
            )
          : null}
      </RightPanelContainer>

      {initialJourneys.length > 0
        ? (
            <RightPanelContainer contentClassName="xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto">
              <section className="dashboard-right-section rounded-[24px] border px-2 py-3">
                <SectionHeader
                  description="High-signal itineraries people are opening right now."
                  icon={<JourneyIcon className="h-4 w-4" />}
                  title="Popular journeys"
                />

                <div className="mt-3 space-y-1">
                  {initialJourneys.map(journey => (
                    <JourneyItem key={journey.id} journey={journey} />
                  ))}
                </div>
              </section>
            </RightPanelContainer>
          )
        : null}
    </div>
  );
};
