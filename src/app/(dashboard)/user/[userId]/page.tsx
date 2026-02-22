'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Journey } from '@/types/journey.types';
import { useAuthStore } from '@/store/auth.store';
import { useUserDetails, useUserJourneys, useUserPosts } from '@/hooks/user';
import UserProfileHeader from '@/components/user/UserProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';
import ProfileJourneyCard from '@/components/profile/ProfileJourneyCard';
import UserProfileSkeleton from '@/components/ui/UserProfileSkeleton';
import UserPostsGrid from '@/components/user/UserPostsGrid';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AllJourneysMap from '@/components/maps/AllJourneysMap';
import JourneyCard from '@/components/maps/JourneyCard';
import { UserCircleIcon, JourneyIcon } from '@/components/icons';

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const { user: currentUser } = useAuthStore();
  const isViewingOwnProfile = currentUser?.id === userId;

  // Tab state
  const [activeTab, setActiveTab] = useState<'journey' | 'post' | 'map'>(
    'journey'
  );

  // Map-related state
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [showJourneyCard, setShowJourneyCard] = useState(false);
  const [isHoverMode, setIsHoverMode] = useState(false);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // React Query: Fetch user details (always)
  const {
    data: userDetails,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = useUserDetails(userId);

  // React Query: Fetch journeys (only when journey/map tab is active)
  const {
    data: journeys = [],
    isLoading: isLoadingJourneys,
  } = useUserJourneys({
    userId,
    isOwnProfile: isViewingOwnProfile,
    enabled: activeTab === 'journey' || activeTab === 'map',
    recentJourneys: userDetails?.recentJourneys || [],
  });

  // React Query: Fetch posts (only when post tab is active)
  const {
    data: posts = [],
    isLoading: isLoadingPosts,
  } = useUserPosts({
    userId,
    enabled: activeTab === 'post',
  });

  // Map event handlers
  const handleJourneyClick = (journey: Journey) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHoverMode(false);
    setSelectedJourney(journey);
    setShowJourneyCard(true);
  };

  const handleJourneyHover = (journey: Journey) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHoverMode(true);
    setSelectedJourney(journey);
    setShowJourneyCard(true);
  };

  const handleJourneyHoverEnd = () => {
    if (!isHoverMode) return;
    hoverTimeoutRef.current = setTimeout(() => {
      setShowJourneyCard(false);
      setSelectedJourney(null);
      setIsHoverMode(false);
    }, 500);
  };

  const handleCloseJourneyCard = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setShowJourneyCard(false);
    setSelectedJourney(null);
    setIsHoverMode(false);
  };

  const handleCardMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleCardMouseLeave = () => {
    if (isHoverMode) {
      handleJourneyHoverEnd();
    }
  };

  // Loading state - only show skeleton on initial load
  if (isLoadingDetails) {
    return <UserProfileSkeleton />;
  }

  // Error state
  if (detailsError || !userDetails) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-16 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center">
          <UserCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            User Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {detailsError?.message ||
              "The user you're looking for doesn't exist or couldn't be loaded."}
          </p>
          <Button
            variant="primary"
            onClick={() => router.back()}
            icon={<ArrowLeft className="w-4 h-4" />}
            iconPosition="leading"
          >
            Go Back
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex flex-col items-start gap-6 flex-1 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* User Profile Header */}
      <UserProfileHeader
        user={userDetails.user}
        stats={userDetails.stats}
        relationshipStatus={userDetails.relationshipStatus}
        onFollowChange={isFollowing => {
          // Update cached data when follow status changes
          // React Query will handle the cache update
          // This is just for immediate UI feedback
        }}
      />

      {/* Profile Navigation Tabs */}
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'journey' && (
        <div className="flex flex-col items-start gap-4 w-full px-4 sm:px-6">
          <div className="flex justify-center items-center gap-2.5 w-full">
            <h2 className="flex-1 text-black font-outfit text-2xl font-medium leading-[120%]">
              {userDetails.user.username}&apos;s Journeys
            </h2>
          </div>

          {/* Journey Cards */}
          <div className="flex flex-col items-start gap-3 w-full">
            {isLoadingJourneys ? (
              <div className="flex items-center justify-center py-8 w-full">
                <LoadingSpinner size="md" />
              </div>
            ) : journeys.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 w-full">
                {journeys.map((journey, index) => (
                  <ProfileJourneyCard
                    key={journey.id}
                    journey={journey}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="w-full text-center py-8">
                <JourneyIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">
                  {userDetails.user.username} hasn&apos;t created any journeys
                  yet.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'post' && (
        <div className="flex flex-col items-start gap-4 w-full px-4 sm:px-6">
          <h2 className="text-black font-outfit text-2xl font-medium leading-[120%]">
            {userDetails.user.username}&apos;s Posts
          </h2>
          <UserPostsGrid
            posts={posts}
            isLoading={isLoadingPosts}
            username={userDetails.user.username}
          />
        </div>
      )}

      {activeTab === 'map' && (
        <div className="flex flex-col gap-4 w-full px-4 sm:px-6">
          {/* Map Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-black font-outfit text-2xl font-medium leading-[120%]">
                {userDetails.user.username}&apos;s Travel Map
              </h2>
              <p className="text-gray-600 mt-1">
                Explore {userDetails.user.username}&apos;s journeys on the map
                {journeys.length > 0 && (
                  <span className="ml-2 text-sm">
                    ({journeys.length} journey
                    {journeys.length !== 1 ? 's' : ''})
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Map Container */}
          <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] bg-gray-50 rounded-lg overflow-hidden shadow-sm">
            {isLoadingJourneys ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner size="lg" />
              </div>
            ) : journeys.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <JourneyIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No journeys yet
                  </h3>
                  <p className="text-gray-600">
                    {userDetails.user.username} hasn&apos;t created any journeys to display on the map.
                  </p>
                </div>
              </div>
            ) : (
              <AllJourneysMap
                journeys={journeys}
                onJourneyClick={handleJourneyClick}
                onJourneyHover={handleJourneyHover}
                onJourneyHoverEnd={handleJourneyHoverEnd}
                selectedJourney={selectedJourney}
                overlay={
                  showJourneyCard && selectedJourney ? (
                    <motion.div
                      className={`absolute inset-0 flex items-center justify-center p-4 z-50 ${
                        isHoverMode
                          ? 'pointer-events-none'
                          : 'bg-white/30 backdrop-blur-md'
                      }`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={isHoverMode ? undefined : handleCloseJourneyCard}
                    >
                      <motion.div
                        className="max-w-md w-full pointer-events-auto"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ duration: 0.2 }}
                        onClick={e => e.stopPropagation()}
                        onMouseEnter={handleCardMouseEnter}
                        onMouseLeave={handleCardMouseLeave}
                      >
                        <div className={isHoverMode ? 'shadow-2xl rounded-xl' : ''}>
                          <JourneyCard
                            journey={selectedJourney}
                            onClose={handleCloseJourneyCard}
                          />
                        </div>
                      </motion.div>
                    </motion.div>
                  ) : null
                }
              />
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
