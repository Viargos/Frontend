'use client';

import type { ProfileJourney } from '@/modules/profile/types/profile.types';
import { useRouter } from 'next/navigation';
import { JourneyIcon } from '@/modules/common/icons';
import { ProfileJourneyCard } from '@/modules/profile/components/ProfileJourneyCard';

type ProfileJourneysTabProps = {
  isLoading?: boolean;
  isOwnProfile?: boolean;
  journeys: ProfileJourney[];
  ownerName: string;
};

export const ProfileJourneysTab = (props: ProfileJourneysTabProps) => {
  const {
    isLoading = false,
    isOwnProfile = true,
    journeys,
    ownerName,
  } = props;
  const router = useRouter();
  const contentPaddingClass = isOwnProfile ? 'pb-12' : 'px-4 pb-12 sm:px-6';

  return (
    <div className={`flex w-full flex-col items-start gap-4 ${contentPaddingClass}`}>
      <div className="flex w-full items-center justify-center gap-2.5">
        <h2 className="flex-1 font-outfit text-2xl leading-[120%] font-medium text-black">
          {isOwnProfile ? 'My Journeys' : `${ownerName}'s Journeys`}
        </h2>
        {isOwnProfile
          ? (
              <button
                className="rounded-md bg-[#160E53] px-4 py-2 text-sm font-medium text-white hover:bg-[#241A7A]"
                onClick={() => router.push('/create-journey')}
                type="button"
              >
                Create new Journey
              </button>
            )
          : null}
      </div>

      <div className="flex w-full flex-col items-start gap-3">
        {isLoading
          ? (
              <div className="flex w-full items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
              </div>
            )
          : journeys.length > 0
            ? (
                <div className="grid w-full grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
                  {journeys.map((journey, index) => (
                    <ProfileJourneyCard
                      key={journey.id}
                      index={index}
                      isOwnProfile={isOwnProfile}
                      journey={journey}
                    />
                  ))}
                </div>
              )
            : (
                <div className="w-full py-8 text-center">
                  <JourneyIcon className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                  <p className="mb-4 text-gray-500">
                    {isOwnProfile
                      ? 'No journeys yet. Create your first journey to get started!'
                      : `${ownerName} hasn't created any journeys yet.`}
                  </p>
                  {isOwnProfile
                    ? (
                        <button
                          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          onClick={() => router.push('/create-journey')}
                          type="button"
                        >
                          Create Your First Journey
                        </button>
                      )
                    : null}
                </div>
              )}
      </div>
    </div>
  );
};
