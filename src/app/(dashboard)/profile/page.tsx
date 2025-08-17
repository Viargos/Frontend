"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useProfileStore } from "@/store/profile.store";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import NewJourneyModal from "@/components/journey/NewJourneyModal";
import ProfileJourneyCard from "@/components/profile/ProfileJourneyCard";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { convertRecentJourneysToJourneys } from "@/utils/journey.utils";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuthStore();
  const {
    profile,
    stats,
    recentJourneys,
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
    clearError,
  } = useProfileStore();
  const router = useRouter();
  const [isNewJourneyModalOpen, setIsNewJourneyModalOpen] = useState(false);

  // Load profile and stats when component mounts
  useEffect(() => {
    if (isAuthenticated && user) {
      // Use optimized method that loads both profile, stats, and recent journeys in one call
      loadProfileAndStats();
    }
  }, [isAuthenticated, user, loadProfileAndStats]);

  // Convert recent journeys to journey format for JourneyCard component
  const journeys = convertRecentJourneysToJourneys(recentJourneys);

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

  const handleCreateJourney = (journeyData: {
    name: string;
    journeyDate: string;
    location: string;
    locationData?: {
      id: string;
      name: string;
      lat: number;
      lng: number;
      address: string;
    };
  }) => {
    setIsNewJourneyModalOpen(false);

    if (journeyData.locationData) {
      sessionStorage.setItem(
        "journeyLocationData",
        JSON.stringify(journeyData.locationData)
      );
    }

    router.push(`/journey/new`);
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
      className="flex flex-col items-start gap-6 flex-1 w-full max-w-4xl mx-auto"
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
        {activeTab === "journey" && (
          <div className="flex flex-col items-start gap-4 w-full">
            <div className="flex justify-center items-center gap-2.5 w-full">
              <h2 className="flex-1 text-black font-outfit text-2xl font-medium leading-[120%]">
                My Journey
              </h2>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsNewJourneyModalOpen(true)}
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
              ) : journeys.length > 0 ? (
                <div className="flex flex-col gap-4 w-full">
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
                    onClick={() => setIsNewJourneyModalOpen(true)}
                  >
                    Create Your First Journey
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "post" && (
          <div className="flex flex-col items-start gap-4 w-full">
            <h2 className="text-black font-outfit text-2xl font-medium leading-[120%]">
              My Posts
            </h2>
            <div className="text-center text-gray-500 py-8 w-full">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p>No posts yet. Create your first post!</p>
            </div>
          </div>
        )}

        {activeTab === "map" && (
          <div className="flex flex-col items-start gap-4 w-full">
            <h2 className="text-black font-outfit text-2xl font-medium leading-[120%]">
              My Travel Map
            </h2>
            <div className="text-center text-gray-500 py-8 w-full">
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
              <p>Your travel map will appear here once you create journeys!</p>
            </div>
          </div>
        )}
      {/* New Journey Modal */}
      <NewJourneyModal
        isOpen={isNewJourneyModalOpen}
        onClose={() => setIsNewJourneyModalOpen(false)}
        onSubmit={handleCreateJourney}
      />
    </motion.div>
  );
}
