'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { UserProfile } from '@/types/profile.types';
import { UserStats } from '@/types/user.types';
import { LoadingSpinner } from '@/components/ui';
import FollowersFollowingModal, { ModalType } from './FollowersFollowingModal';
import { PlusIcon, MapPinIcon } from '@/components/icons';

interface ProfileHeaderProps {
  profile: UserProfile;
  profileImageUrl?: string | null;
  bannerImageUrl?: string | null;
  isImageUploading?: boolean;
  stats?: UserStats | null;
  isStatsLoading?: boolean;
  onProfileImageUpload?: (file: File) => void;
  onBannerImageUpload?: (file: File) => void;
}

// Stat item component for use within the header
const StatItem = ({
  value,
  label,
  onClick,
  clickable = false,
}: {
  value: number;
  label: string;
  onClick?: () => void;
  clickable?: boolean;
}) => {
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div
      className={`flex flex-col items-center gap-1 min-w-0 ${
        clickable ? 'cursor-pointer hover:scale-105 transition-transform' : ''
      }`}
      onClick={clickable ? onClick : undefined}
    >
      <span className="text-sm sm:text-base lg:text-lg font-bold text-blue-600">
        {formatCount(value)}
      </span>
      <span
        className={`text-xs sm:text-sm whitespace-nowrap text-blue-600 ${
          clickable ? 'hover:underline' : ''
        }`}
      >
        {label}
      </span>
    </div>
  );
};

export default function ProfileHeader({
  profile,
  profileImageUrl = null,
  bannerImageUrl = null,
  isImageUploading = false,
  stats = null,
  isStatsLoading = false,
  onProfileImageUpload,
  onBannerImageUpload,
}: ProfileHeaderProps) {
  const profileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<ModalType>('followers');

  const handleOpenFollowers = () => {
    setModalTab('followers');
    setIsModalOpen(true);
  };

  const handleOpenFollowing = () => {
    setModalTab('following');
    setIsModalOpen(true);
  };

  const handleProfileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onProfileImageUpload) {
      onProfileImageUpload(file);
    }
  };

  const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onBannerImageUpload) {
      onBannerImageUpload(file);
    }
  };

  return (
    <motion.div
      className="flex flex-col justify-center items-start w-full rounded-md bg-white shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Hero Background Image */}
      <div className="relative h-32 sm:h-40 md:h-48 lg:h-56 w-full">
        {bannerImageUrl ? (
          <Image
            src={bannerImageUrl}
            alt="Profile background"
            className="h-full w-full object-cover"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        ) : (
          <Image
            src="/london.png?format=webp&width=800"
            alt="Profile background"
            className="h-full w-full object-cover"
            width={800}
            height={224}
          />
        )}

        {/* Banner Upload Button - Only show if upload handler provided */}
        {onBannerImageUpload && (
          <>
            <motion.button
              onClick={() => bannerInputRef.current?.click()}
              disabled={isImageUploading}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white backdrop-blur-sm text-blue-600 px-2 py-1 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm hover:bg-[#160E53] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-2"
              whileHover={{
                scale: 1.05,
                backgroundColor: '#001a6e',
                color: 'white',
              }}
              whileTap={{ scale: 0.95 }}
            >
              {isImageUploading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Uploading...
                </>
              ) : (
                'Change Banner'
              )}
            </motion.button>

            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerUpload}
              disabled={isImageUploading}
            />
          </>
        )}
      </div>

      {/* Avatar and Info Section */}
      <div className="flex pb-4 sm:pb-6 px-4 sm:px-6 w-full -mt-12 sm:justify-between flex-col sm:flex-row items-center sm:items-end justify-start gap-4 sm:gap-6 lg:gap-10 xl:gap-16">
        <div className="flex flex-col justify-center items-center sm:items-start gap-2 sm:gap-3">
          {/* Avatar Container */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-lg relative">
            {/* Background with gradient */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 absolute left-0 top-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-lg bg-primary-purple absolute left-0 top-0" />
              <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-lg bg-white bg-opacity-30 absolute left-2 top-2" />
            </div>

            {/* Avatar Image */}
            {profileImageUrl ? (
              <Image
                src={profileImageUrl}
                alt="Profile"
                width={128}
                height={128}
                className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-lg absolute left-0 top-0 object-cover"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-lg absolute left-0 top-0 bg-[#160E53] flex items-center justify-center text-white text-lg sm:text-xl lg:text-2xl font-bold">
                {profile.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}

            {/* Profile Upload Button - Only show if upload handler provided */}
            {onProfileImageUpload && (
              <>
                <motion.button
                  onClick={() => profileInputRef.current?.click()}
                  disabled={isImageUploading}
                  className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-[#160E53] text-white p-1.5 sm:p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isImageUploading ? (
                    <LoadingSpinner size="xs" />
                  ) : (
                    <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                </motion.button>

                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileUpload}
                  disabled={isImageUploading}
                />
              </>
            )}
          </div>

          {/* Name */}
          <motion.h1
            className="text-heading font-mulish text-xl sm:text-2xl lg:text-3xl font-bold leading-tight text-center sm:text-left"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {profile.username}
          </motion.h1>

          {/* Bio */}
          {profile.bio && (
            <motion.p
              className="text-gray-600 text-sm sm:text-base text-center sm:text-left max-w-xs sm:max-w-sm lg:max-w-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {profile.bio}
            </motion.p>
          )}

          {/* Location */}
          {profile.location && (
            <motion.div
              className="flex items-center gap-1 text-gray-500 text-sm sm:text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              {profile.location}
            </motion.div>
          )}

          {/* Email - Only shown on own profile */}
          {profile.email && (
            <motion.p
              className="text-gray-600 text-sm sm:text-base text-center sm:text-left"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {profile.email}
            </motion.p>
          )}

          {/* Join Date - Only shown on own profile */}
          {profile.createdAt && (
            <motion.p
              className="text-gray-500 text-xs sm:text-sm text-center sm:text-left"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Joined{' '}
              {new Date(profile.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </motion.p>
          )}
        </div>

        {/* Stats Display */}
        <motion.div
          className="flex items-center justify-center sm:justify-start gap-4 sm:gap-6 lg:gap-8 w-full sm:w-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {isStatsLoading ? (
            <div className="flex items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex flex-col items-center gap-1">
                  <div className="animate-pulse bg-gray-200 h-4 sm:h-5 lg:h-6 w-6 sm:w-8 lg:w-12 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-3 sm:h-4 w-10 sm:w-12 lg:w-16 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              <StatItem label="Posts" value={stats?.postsCount || 0} />
              <StatItem label="Journeys" value={stats?.journeysCount || 0} />
              <StatItem
                label="Followers"
                value={stats?.followersCount || 0}
                onClick={handleOpenFollowers}
                clickable
              />
              <StatItem
                label="Following"
                value={stats?.followingCount || 0}
                onClick={handleOpenFollowing}
                clickable
              />
            </div>
          )}
        </motion.div>
      </div>

      {/* Followers/Following Modal */}
      <FollowersFollowingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={profile.id}
        initialTab={modalTab}
        username={profile.username}
      />
    </motion.div>
  );
}
