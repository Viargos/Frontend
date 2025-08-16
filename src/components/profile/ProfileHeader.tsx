'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { UserProfile, UserStats } from '@/types/profile.types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ProfileHeaderProps {
  profile: UserProfile;
  profileImageUrl: string | null;
  bannerImageUrl: string | null;
  isImageUploading: boolean;
  stats?: UserStats | null;
  isStatsLoading?: boolean;
  onProfileImageUpload: (file: File) => void;
  onBannerImageUpload: (file: File) => void;
}

// Stat item component for use within the header
const StatItem = ({ value, label }: { value: number; label: string }) => {
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
    <div className="flex flex-col items-center gap-1 cursor-pointer hover:scale-105 transition-transform">
      <span className="text-lg font-bold text-gray-900">{formatCount(value)}</span>
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  );
};

export default function ProfileHeader({
  profile,
  profileImageUrl,
  bannerImageUrl,
  isImageUploading,
  stats = null,
  isStatsLoading = false,
  onProfileImageUpload,
  onBannerImageUpload,
}: ProfileHeaderProps) {
  const profileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleProfileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onProfileImageUpload(file);
    }
  };

  const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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
      <div className="relative h-[180px] w-full">
        {bannerImageUrl ? (
          <Image
            src={bannerImageUrl}
            alt="Profile background"
            className="h-[180px] w-full object-cover"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        ) : (
          <Image
            src="/london.png?format=webp&width=800"
            alt="Profile background"
            className="h-[180px] w-full object-cover"
            width={800}
            height={180}
          />
        )}
        
        {/* Banner Upload Button */}
        <motion.button
          onClick={() => bannerInputRef.current?.click()}
          disabled={isImageUploading}
          className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-md text-sm hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
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
      </div>

      {/* Avatar and Info Section */}
      <div className="flex sm:h-34 pb-6 px-6 items-end w-full -mt-12 sm:justify-start sm:gap-10 sm:flex-row flex-col sm:items-end items-start h-[250px] justify-start gap-5">
        <div className="flex flex-col justify-center items-center gap-2">
          {/* Avatar Container */}
          <div className="w-30 h-30 rounded-lg relative">
            {/* Background with gradient */}
            <div className="w-30 h-30 absolute left-0 top-0">
              <div className="w-30 h-30 rounded-lg bg-primary-purple absolute left-0 top-0" />
              <div className="w-24 h-24 rounded-lg bg-white bg-opacity-30 absolute left-3 top-3" />
            </div>
            
            {/* Avatar Image */}
            {profileImageUrl ? (
              <Image
                src={profileImageUrl}
                alt="Profile"
                width={120}
                height={120}
                className="w-30 h-30 rounded-lg absolute left-0 top-0 object-cover"
              />
            ) : (
              <div className="w-30 h-30 rounded-lg absolute left-0 top-0 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {profile.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            
            {/* Profile Upload Button */}
            <motion.button
              onClick={() => profileInputRef.current?.click()}
              disabled={isImageUploading}
              className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isImageUploading ? (
                <LoadingSpinner size="xs" />
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
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
          </div>

          {/* Name */}
          <motion.h1 
            className="text-heading font-mulish text-[22px] font-bold leading-7"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {profile.username}
          </motion.h1>

          {/* Bio */}
          {profile.bio && (
            <motion.p 
              className="text-gray-600 text-sm text-center max-w-xs"
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
              className="flex items-center gap-1 text-gray-500 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {profile.location}
            </motion.div>
          )}
        </div>
        
        {/* Stats Display */}
        <motion.div 
          className="flex items-center gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {isStatsLoading ? (
            <div className="flex items-center gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex flex-col items-center gap-1">
                  <div className="animate-pulse bg-gray-200 h-6 w-12 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <StatItem label="Posts" value={stats?.posts || 0} />
              <StatItem label="Journeys" value={stats?.journeys || 0} />
              <StatItem label="Followers" value={stats?.followers || 0} />
              <StatItem label="Following" value={stats?.following || 0} />
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
