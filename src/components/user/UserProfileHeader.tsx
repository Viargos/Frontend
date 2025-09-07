"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { User, UserStats } from "@/types/user.types";

interface UserProfileHeaderProps {
  user: User;
  stats: UserStats;
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
    <div className="flex flex-col items-center gap-1 cursor-pointer hover:scale-105 transition-transform min-w-0">
      <span className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">
        {formatCount(value)}
      </span>
      <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
        {label}
      </span>
    </div>
  );
};

export default function UserProfileHeader({ user, stats }: UserProfileHeaderProps) {
  return (
    <motion.div
      className="flex flex-col justify-center items-start w-full rounded-md bg-white shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Hero Background Image */}
      <div className="relative h-32 sm:h-40 md:h-48 lg:h-56 w-full">
        {user.bannerImage ? (
          <Image
            src={user.bannerImage}
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
            {user.profileImage ? (
              <Image
                src={user.profileImage}
                alt="Profile"
                width={128}
                height={128}
                className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-lg absolute left-0 top-0 object-cover"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-lg absolute left-0 top-0 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg sm:text-xl lg:text-2xl font-bold">
                {user.username?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>

          {/* Name */}
          <motion.h1
            className="text-heading font-mulish text-xl sm:text-2xl lg:text-3xl font-bold leading-tight text-center sm:text-left"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {user.username}
          </motion.h1>

          {/* Email */}
          <motion.p
            className="text-gray-600 text-sm sm:text-base text-center sm:text-left"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {user.email}
          </motion.p>

          {/* Join Date */}
          <motion.p
            className="text-gray-500 text-xs sm:text-sm text-center sm:text-left"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Joined {new Date(user.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </motion.p>
        </div>

        {/* Stats Display */}
        <motion.div
          className="flex items-center justify-center sm:justify-start gap-4 sm:gap-6 lg:gap-8 w-full sm:w-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            <StatItem label="Posts" value={stats?.postsCount || 0} />
            <StatItem label="Journeys" value={stats?.journeysCount || 0} />
            <StatItem label="Followers" value={stats?.followersCount || 0} />
            <StatItem label="Following" value={stats?.followingCount || 0} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
