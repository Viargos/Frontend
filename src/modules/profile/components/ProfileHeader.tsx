'use client';

import type { UserProfile } from '@/modules/profile/types/profile.types';
import * as motion from 'framer-motion/client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MapPinIcon } from '@/modules/common/icons';
import { useFollowUser } from '@/modules/profile/hooks';

type ProfileHeaderProps = {
  heading?: string;
  isOwnProfile?: boolean;
  profile: UserProfile;
};

type StatItemProps = {
  label: string;
  value: number;
};

const StatItem = (props: StatItemProps) => {
  const { label, value } = props;

  return (
    <div className="flex min-w-0 flex-col items-center gap-1">
      <span className="text-sm font-bold text-blue-600 sm:text-base lg:text-lg">{value}</span>
      <span className="text-xs whitespace-nowrap text-blue-600 sm:text-sm">{label}</span>
    </div>
  );
};

export const ProfileHeader = (props: ProfileHeaderProps) => {
  const { heading, isOwnProfile = true, profile } = props;
  const router = useRouter();
  const {
    followers,
    isFollowing,
    isPending: isFollowPending,
    toggleFollow,
  } = useFollowUser({
    initialFollowers: profile.stats.followers,
    initialIsFollowing: profile.relationship.isFollowing,
    userId: profile.user.id,
  });

  return (
    <motion.div
      className="flex w-full flex-col items-start justify-center overflow-hidden rounded-md bg-white shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="relative h-32 w-full sm:h-40 md:h-48 lg:h-56">
        {profile.user.bannerImage
          ? (
              <Image
                alt="Profile background"
                className="h-full w-full object-cover"
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                src={profile.user.bannerImage}
                unoptimized
              />
            )
          : (
              <Image
                alt="Profile background"
                className="h-full w-full object-cover"
                height={224}
                src="/london.png"
                width={800}
              />
            )}
      </div>

      <div className="-mt-12 flex w-full flex-col items-center justify-start gap-4 px-4 pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:px-6 sm:pb-6 lg:gap-10 xl:gap-16">
        <div className="flex flex-col items-center justify-center gap-2 sm:items-start sm:gap-3">
          <div className="relative h-24 w-24 rounded-lg sm:h-28 sm:w-28 lg:h-32 lg:w-32">
            <div className="absolute top-0 left-0 h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32">
              <div className="bg-primary-purple absolute top-0 left-0 h-24 w-24 rounded-lg sm:h-28 sm:w-28 lg:h-32 lg:w-32" />
              <div className="bg-opacity-30 absolute top-2 left-2 h-20 w-20 rounded-lg bg-white sm:h-24 sm:w-24 lg:h-28 lg:w-28" />
            </div>

            {profile.user.profileImage
              ? (
                  <Image
                    alt="Profile"
                    className="absolute top-0 left-0 h-24 w-24 rounded-lg object-cover sm:h-28 sm:w-28 lg:h-32 lg:w-32"
                    height={128}
                    src={profile.user.profileImage}
                    unoptimized
                    width={128}
                  />
                )
              : (
                  <div className="absolute top-0 left-0 flex h-24 w-24 items-center justify-center rounded-lg bg-[#160E53] text-lg font-bold text-white sm:h-28 sm:w-28 sm:text-xl lg:h-32 lg:w-32 lg:text-2xl">
                    {profile.user.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
          </div>

          <motion.h1
            className="text-heading font-mulish text-center text-xl leading-tight font-bold sm:text-left sm:text-2xl lg:text-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {heading || profile.user.username}
          </motion.h1>

          {profile.user.bio
            ? (
                <motion.p
                  className="max-w-xs text-center text-sm text-gray-600 sm:max-w-sm sm:text-left sm:text-base lg:max-w-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {profile.user.bio}
                </motion.p>
              )
            : null}

          {profile.user.location
            ? (
                <motion.div
                  className="flex items-center gap-1 text-sm text-gray-500 sm:text-base"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <MapPinIcon className="h-4 w-4 text-gray-500 sm:h-5 sm:w-5" />
                  {profile.user.location}
                </motion.div>
              )
            : null}

          {profile.user.email && isOwnProfile
            ? (
                <motion.p
                  className="text-center text-sm text-gray-600 sm:text-left sm:text-base"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {profile.user.email}
                </motion.p>
              )
            : null}

          {profile.user.createdAt && isOwnProfile
            ? (
                <motion.p
                  className="text-center text-xs text-gray-500 sm:text-left sm:text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  Joined
                  {' '}
                  {new Date(profile.user.createdAt).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </motion.p>
              )
            : null}
        </div>

        <motion.div
          className="flex w-full flex-col items-center gap-4 sm:w-auto sm:items-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {!isOwnProfile
            ? (
                <div className="flex items-center gap-3">
                  <button
                    className="min-w-[100px] rounded-md border border-[#160E53] bg-[#160E53] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#241A7A] disabled:cursor-not-allowed disabled:opacity-60"
                    type="button"
                    onClick={() => router.push(`/messages?userId=${encodeURIComponent(profile.user.id)}`)}
                  >
                    Message
                  </button>
                  <button
                    className={`min-w-[100px] rounded-md border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                      isFollowing
                        ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        : 'border-[#160E53] bg-[#160E53] text-white hover:bg-[#241A7A]'
                    }`}
                    disabled={isFollowPending}
                    type="button"
                    onClick={() => {
                      void toggleFollow();
                    }}
                  >
                    {isFollowPending
                      ? 'Updating...'
                      : isFollowing
                        ? 'Following'
                        : 'Follow'}
                  </button>
                </div>
              )
            : null}

          <div className="flex items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            <StatItem label="Posts" value={profile.stats.posts} />
            <StatItem label="Journeys" value={profile.stats.journeys} />
            <StatItem label="Followers" value={followers} />
            <StatItem label="Following" value={profile.stats.following} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
