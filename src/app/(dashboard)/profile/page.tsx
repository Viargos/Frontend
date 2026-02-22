'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useMyJourneys, useDeleteJourney } from '@/hooks/journey/useJourneyQueries';
import { useCurrentUserProfile, useCurrentUserPosts } from '@/hooks/profile';
import { ProfileHeader, ProfileTabs, ProfileJourneyCard, ProfilePostsGrid } from '@/components/profile';
import { Button, LoadingSpinner, UserProfileSkeleton } from '@/components/ui';
import AllJourneysMap from '@/components/maps/AllJourneysMap';
import JourneyCard from '@/components/maps/JourneyCard';
import { Journey } from '@/types/journey.types';
import { JourneyIcon } from '@/components/icons';

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'journey' | 'post' | 'map'>('journey');

  // React Query: Fetch current user profile (always)
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useCurrentUserProfile();

  // React Query: Fetch journeys (only when journey/map tab is active)
  const { data: journeys = [], isLoading: isLoadingJourneys } = useMyJourneys({
    limit: undefined,
    offset: undefined,
    enabled: activeTab === 'journey' || activeTab === 'map',
  });

  // React Query: Fetch posts (only when post tab is active)
  const { data: posts = [], isLoading: isLoadingPosts } = useCurrentUserPosts({
    enabled: activeTab === 'post',
  });

  const deleteJourneyMutation = useDeleteJourney();

  // Map-related state
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [showJourneyCard, setShowJourneyCard] = useState(false);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [isHoverMode, setIsHoverMode] = React.useState(false);

  // Map event handlers
  const handleJourneyClick = (journey: Journey) => {
    // Clear any pending hover timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHoverMode(false); // Click mode - card stays until closed
    setSelectedJourney(journey);
    setShowJourneyCard(true);
  };

  const handleJourneyHover = (journey: Journey) => {
    // Clear any pending hide timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHoverMode(true); // Hover mode - card will hide on mouse leave
    setSelectedJourney(journey);
    setShowJourneyCard(true);
  };

  const handleJourneyHoverEnd = () => {
    // Only auto-hide in hover mode
    if (!isHoverMode) return;

    // Delay hiding to allow mouse to enter the card
    hoverTimeoutRef.current = setTimeout(() => {
      setShowJourneyCard(false);
      setSelectedJourney(null);
      setIsHoverMode(false);
    }, 500); // 500ms delay for stability
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

  // Keep card visible when hovering over it
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

  // Handle journey deletion
  const handleDeleteJourney = async (journeyId: string) => {
    try {
      await deleteJourneyMutation.mutateAsync(journeyId);
      // React Query automatically invalidates and refetches
    } catch (error) {
      console.error('Journey deletion failed:', error);
    }
  };

  const handleEditJourney = (journey: any) => {
    router.push(`/edit-journey/${journey.id}`);
  };

  // Show loading state while profile loading
  if (isLoadingProfile) {
    return <UserProfileSkeleton />;
  }

  // Error state
  if (profileError || !profileData) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-16 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Failed to Load Profile
          </h2>
          <p className="text-gray-600 mb-6">
            {profileError?.message || "Couldn't load your profile data."}
          </p>
          <Button
            variant="primary"
            onClick={() => window.location.reload()}
          >
            Reload Page
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
      {/* Profile Header */}
      <ProfileHeader
        profile={profileData.user}
        profileImageUrl={profileData.user.profileImage}
        bannerImageUrl={profileData.user.bannerImage}
        stats={profileData.stats}
      />

      {/* We've moved the stats to the ProfileHeader component */}

      {/* Profile Navigation Tabs */}
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'journey' && (
        <div className="flex flex-col items-start gap-4 w-full">
          <div className="flex justify-center items-center gap-2.5 w-full">
            <h2 className="flex-1 text-black font-outfit text-2xl font-medium leading-[120%]">
              My Journeys
            </h2>
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/create-journey')}
            >
              Create new Journey
            </Button>
          </div>

          {/* Journey Cards */}
          <div className="flex flex-col items-start gap-3 w-full">
            {isLoadingJourneys ? (
              <div className="flex items-center justify-center py-8 w-full">
                <LoadingSpinner size="lg" />
              </div>
            ) : journeys.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 w-full">
                {journeys.map((journey, index) => (
                  <ProfileJourneyCard
                    key={journey.id}
                    journey={journey}
                    index={index}
                    onDelete={handleDeleteJourney}
                    onEdit={handleEditJourney}
                  />
                ))}
              </div>
            ) : (
              <div className="w-full text-center py-8">
                <JourneyIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">
                  No journeys yet. Create your first journey to get started!
                </p>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => router.push('/create-journey')}
                >
                  Create Your First Journey
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'post' && (
        <div className="flex flex-col items-start gap-4 w-full">
          <h2 className="text-black font-outfit text-2xl font-medium leading-[120%]">
            My Posts
          </h2>
          <ProfilePostsGrid
            posts={posts}
            isLoading={isLoadingPosts}
            username={profileData.user.username}
          />
        </div>
      )}

      {activeTab === 'map' && (
        <div className="flex flex-col gap-4 w-full">
          {/* Map Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-black font-outfit text-2xl font-medium leading-[120%]">
                My Travel Map
              </h2>
              <p className="text-gray-600 mt-1">
                Explore all your journeys on the map - each marker shows the year
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
          <div className="relative w-full h-[600px] bg-gray-50 rounded-lg overflow-hidden shadow-sm">
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
                  <p className="text-gray-600 mb-4">
                    Start creating your first journey to see it on the map.
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => router.push('/create-journey')}
                  >
                    Create Journey
                  </Button>
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
                            ? 'pointer-events-none' // Don't block map interactions in hover mode
                            : 'bg-white/30 backdrop-blur-md' // Full overlay in click mode
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
