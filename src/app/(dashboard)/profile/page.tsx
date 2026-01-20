'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useProfileStore } from '@/store/profile.store';
import { useJourneyStore } from '@/store/journey.store';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ProfileHeader, ProfileTabs, ProfileJourneyCard, ProfilePostsGrid } from '@/components/profile';
import { Button, LoadingSpinner, UserProfileSkeleton } from '@/components/ui';
import AllJourneysMap from '@/components/maps/AllJourneysMap';
import YearFilter from '@/components/maps/YearFilter';
import JourneyCard from '@/components/maps/JourneyCard';
import { Journey } from '@/types/journey.types';
import { UserProfile } from '@/types/profile.types';
import { JourneyIcon } from '@/components/icons';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuthStore();
  const {
    profile,
    stats,
    profileImageUrl,
    bannerImageUrl,
    isLoading,
    isStatsLoading,
    isImageUploading,
    error,
    activeTab,
    setActiveTab,
    loadProfileAndStats,
    uploadProfileImage,
    uploadBannerImage,
    deleteJourney,
    clearError,
  } = useProfileStore();
  const {
    journeys,
    isLoading: isJourneysLoading,
    loadMyJourneys,
    deleteJourney: deleteJourneyFromStore,
  } = useJourneyStore();
  const router = useRouter();

  // Map-related state
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [showJourneyCard, setShowJourneyCard] = useState(false);

  // Load profile and stats when component mounts
  useEffect(() => {
    if (isAuthenticated && user) {
      // Use optimized method that loads both profile, stats, and recent journeys in one call
      loadProfileAndStats();
    }
  }, [isAuthenticated, user, loadProfileAndStats]);

  // Fetch journeys when journey or map tab is active
  useEffect(() => {
    if (isAuthenticated && user && (activeTab === 'journey' || activeTab === 'map')) {
      // Load ALL journeys without limit - explicitly remove limit filter
      loadMyJourneys({ limit: undefined, offset: undefined });
    }
  }, [isAuthenticated, user, activeTab, loadMyJourneys]);

  // Map-related computed values
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    journeys.forEach(journey => {
      if (journey.createdAt) {
        const year = new Date(journey.createdAt).getFullYear();
        years.add(year);
      }
    });
    return Array.from(years).sort((a, b) => b - a); // Most recent first
  }, [journeys]);

  // Filter journeys by selected year
  const filteredJourneys = useMemo(() => {
    if (!selectedYear) return journeys;

    return journeys.filter(journey => {
      if (!journey.createdAt) return false;
      const journeyYear = new Date(journey.createdAt).getFullYear();
      return journeyYear === selectedYear;
    });
  }, [journeys, selectedYear]);

  // Log rendered journeys count when journeys change
  useEffect(() => {
    if (activeTab === 'journey' && journeys.length > 0) {
      console.log("[RENDERED_JOURNEYS_COUNT]", {
        count: journeys.length,
        journeys: journeys
      });
    }
  }, [journeys, activeTab]);

  // Hover state management
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

  // Handle image uploads
  const handleProfileImageUpload = async (file: File) => {
    const result = await uploadProfileImage(file);
    if (!result.success && result.error) {
      console.error('Profile image upload failed:', result.error);
    }
  };

  const handleBannerImageUpload = async (file: File) => {
    const result = await uploadBannerImage(file);
    if (!result.success && result.error) {
      console.error('Banner image upload failed:', result.error);
    }
  };

  // Handle journey deletion
  const handleDeleteJourney = async (journeyId: string) => {
    // Delete from profile store (updates recentJourneys and makes API call)
    const result = await deleteJourney(journeyId);

    // Also update journey store to keep UI in sync
    // The journey store will handle "Journey not found" gracefully
    // Since backend is idempotent, calling both stores is safe
    if (result.success || (result.error && result.error.toLowerCase().includes('journey not found'))) {
      // Update journey store - it will handle errors gracefully
      await deleteJourneyFromStore(journeyId);
    }

    if (!result.success && result.error && !result.error.toLowerCase().includes('journey not found')) {
      console.error('Journey deletion failed:', result.error);
      // You could show a toast notification here
    }
  };

  // Show loading state while profile loading
  if (isLoading) {
    return <UserProfileSkeleton />;
  }

  // Use profile data from the store, fallback to user data
  const currentProfile: UserProfile | null = profile || (user ? {
    id: user.id,
    username: user.username,
    email: user.email,
    phoneNumber: user.phoneNumber,
    bio: user.bio || '',
    location: user.location || '',
    profileImage: user.profileImage,
    bannerImage: user.bannerImage,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  } : null);

  return (
    <motion.div
      className="flex flex-col items-start gap-6 flex-1 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Error Display */}
      {error && (
        <motion.div
          className="w-full bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {error}
          <button
            onClick={clearError}
            className="ml-2 text-red-600 hover:text-red-800 font-medium"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Profile Header */}
      {currentProfile && (
        <ProfileHeader
          profile={currentProfile}
          profileImageUrl={profileImageUrl}
          bannerImageUrl={bannerImageUrl}
          isImageUploading={isImageUploading}
          stats={stats}
          isStatsLoading={isStatsLoading}
          onProfileImageUpload={handleProfileImageUpload}
          onBannerImageUpload={handleBannerImageUpload}
        />
      )}

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
            {isJourneysLoading ? (
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
            userId="me"
            onEditPost={postId => {
              // TODO: Implement edit functionality
              console.log('Edit post:', postId);
            }}
            onDeletePost={postId => {
              console.log('Post deleted:', postId);
            }}
          />
        </div>
      )}

      {activeTab === 'map' && (
        <div className="flex flex-col gap-4 w-full">
          {/* Map Header with Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-black font-outfit text-2xl font-medium leading-[120%]">
                My Travel Map
              </h2>
              <p className="text-gray-600 mt-1">
                Explore all your journeys on the map
                {filteredJourneys.length > 0 && (
                  <span className="ml-2 text-sm">
                    ({filteredJourneys.length} journey
                    {filteredJourneys.length !== 1 ? 's' : ''})
                  </span>
                )}
              </p>
            </div>

            {/* Year Filter */}
            <YearFilter
              availableYears={availableYears}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
            />
          </div>

          {/* Map Container */}
          <div className="relative w-full h-[600px] bg-gray-50 rounded-lg overflow-hidden shadow-sm">
            {/* Debug info - remove this after testing */}
            {(() => {
              console.log('Map Tab Debug:', {
                isJourneysLoading,
                journeysCount: journeys.length,
                filteredJourneysCount: filteredJourneys.length,
                selectedYear,
              });
              return null;
            })()}

            {isJourneysLoading ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredJourneys.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <JourneyIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedYear
                      ? `No journeys in ${selectedYear}`
                      : 'No journeys yet'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {selectedYear
                      ? 'Try selecting a different year or create a new journey.'
                      : 'Start creating your first journey to see it on the map.'}
                  </p>
                  {!selectedYear && (
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => router.push('/create-journey')}
                    >
                      Create Journey
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {console.log(
                  'Rendering AllJourneysMap with',
                  filteredJourneys.length,
                  'journeys'
                )}
                <AllJourneysMap
                  journeys={filteredJourneys}
                  onJourneyClick={handleJourneyClick}
                  onJourneyHover={handleJourneyHover}
                  onJourneyHoverEnd={handleJourneyHoverEnd}
                  selectedJourney={selectedJourney}
                />
              </>
            )}

            {/* Journey Card Overlay - Shows on hover */}
            {showJourneyCard && selectedJourney && (
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
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
