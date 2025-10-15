'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useProfileStore } from '@/store/profile.store';
import { useJourneyStore } from '@/store/journey.store';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';
import ProfileJourneyCard from '@/components/profile/ProfileJourneyCard';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { convertRecentJourneysToJourneys } from '@/utils/journey.utils';
import PostsList from '@/components/post/PostsList';
import ProfilePostsGrid from '@/components/profile/ProfilePostsGrid';
import UserPostsGrid from '@/components/user/UserPostsGrid';
import AllJourneysMap from '@/components/maps/AllJourneysMap';
import YearFilter from '@/components/maps/YearFilter';
import JourneyCard from '@/components/maps/JourneyCard';
import { Journey } from '@/types/journey.types';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuthStore();
  const {
    profile,
    stats,
    recentJourneys,
    recentPosts,
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

  // Fetch journeys when map tab is active
  useEffect(() => {
    if (isAuthenticated && user && activeTab === 'map') {
      loadMyJourneys();
    }
  }, [isAuthenticated, user, activeTab, loadMyJourneys]);

  // Convert recent journeys to journey format for JourneyCard component
  const recentJourneysConverted =
    convertRecentJourneysToJourneys(recentJourneys);

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

  // Map event handlers
  const handleJourneyClick = (journey: Journey) => {
    setSelectedJourney(journey);
    setShowJourneyCard(true);
  };

  const handleCloseJourneyCard = () => {
    setShowJourneyCard(false);
    setSelectedJourney(null);
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
    const result = await deleteJourney(journeyId);
    if (!result.success && result.error) {
      console.error('Journey deletion failed:', result.error);
      // You could show a toast notification here
    }
  };

  // Show loading state while profile loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Use profile data from the store, fallback to user data
  const currentProfile = profile || {
    ...user,
    bio: user.bio || '',
    location: user.location || '',
  };

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

      {/* We've moved the stats to the ProfileHeader component */}

      {/* Profile Navigation Tabs */}
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'journey' && (
        <div className="flex flex-col items-start gap-4 w-full">
          <div className="flex justify-center items-center gap-2.5 w-full">
            <h2 className="flex-1 text-black font-outfit text-2xl font-medium leading-[120%]">
              My Journey
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
            {isLoading ? (
              <div className="flex items-center justify-center py-8 w-full">
                <LoadingSpinner size="lg" />
              </div>
            ) : recentJourneysConverted.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 w-full">
                {recentJourneysConverted.map((journey, index) => (
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
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                <p className="text-gray-500 mb-4">
                  No journeys yet. Create your first journey to get started!
                </p>
                <Button
                  variant="outline"
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
            {console.log('Map Tab Debug:', {
              isJourneysLoading,
              journeysCount: journeys.length,
              filteredJourneysCount: filteredJourneys.length,
              selectedYear,
            })}

            {isJourneysLoading ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredJourneys.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
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
                  selectedJourney={selectedJourney}
                />
              </>
            )}

            {/* Journey Card Overlay */}
            {showJourneyCard && selectedJourney && (
              <motion.div
                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                onClick={handleCloseJourneyCard}
              >
                <motion.div
                  className="max-w-md w-full"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  onClick={e => e.stopPropagation()}
                >
                  <JourneyCard
                    journey={selectedJourney}
                    onClose={handleCloseJourneyCard}
                  />
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
