"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { userService } from "@/lib/services/service-factory";
import { UserDetailsData } from "@/types/user.types";
import { convertRecentJourneysToJourneys } from "@/utils/journey.utils";
import UserProfileHeader from "@/components/user/UserProfileHeader";
import UserProfileTabs from "@/components/user/UserProfileTabs";
import ProfileTabs from "@/components/profile/ProfileTabs";
import ProfileJourneyCard from "@/components/profile/ProfileJourneyCard";
import UserProfileSkeleton from "@/components/ui/UserProfileSkeleton";
import UserPostsGrid from "@/components/user/UserPostsGrid";
import Button from "@/components/ui/Button";

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  
  const [userDetails, setUserDetails] = useState<UserDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'journey' | 'post' | 'map'>('journey');

  // Load user details
  useEffect(() => {
    const loadUserDetails = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await userService.getUserDetails(userId);
        
        if (response.statusCode === 10000) {
          setUserDetails(response.data);
        } else {
          setError(response.message || 'Failed to load user details');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load user details');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserDetails();
  }, [userId]);

  // Convert recent journeys to journey format for JourneyCard component
  const journeys = userDetails ? convertRecentJourneysToJourneys(userDetails.recentJourneys) : [];

  if (isLoading) {
    return <UserProfileSkeleton />;
  }

  if (error || !userDetails) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-16 px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            User Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "The user you're looking for doesn't exist or couldn't be loaded."}
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
        onFollowChange={(isFollowing) => {
          // Update local stats when follow status changes
          setUserDetails(prev => prev ? {
            ...prev,
            relationshipStatus: {
              ...prev.relationshipStatus,
              isFollowing
            },
            stats: {
              ...prev.stats,
              followersCount: isFollowing 
                ? prev.stats.followersCount + 1 
                : prev.stats.followersCount - 1
            }
          } : null);
        }}
      />

      {/* Profile Navigation Tabs */}
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === "journey" && (
        <div className="flex flex-col items-start gap-4 w-full px-4 sm:px-6">
          <div className="flex justify-center items-center gap-2.5 w-full">
            <h2 className="flex-1 text-black font-outfit text-2xl font-medium leading-[120%]">
              {userDetails.user.username}'s Journeys
            </h2>
          </div>

          {/* Journey Cards */}
          <div className="flex flex-col items-start gap-3 w-full">
            {journeys.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 w-full">
                {journeys.map((journey, index) => (
                  <ProfileJourneyCard
                    key={journey.id}
                    journey={journey}
                    index={index}
                    // No onDelete prop means no delete button will show
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
                <p className="text-gray-500">
                  {userDetails.user.username} hasn't created any journeys yet.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "post" && (
        <div className="flex flex-col items-start gap-4 w-full px-4 sm:px-6">
          <h2 className="text-black font-outfit text-2xl font-medium leading-[120%]">
            {userDetails.user.username}'s Posts
          </h2>
          {console.log('User details recentPosts:', userDetails.recentPosts)}
          <UserPostsGrid 
            posts={userDetails.recentPosts}
            username={userDetails.user.username}
          />
        </div>
      )}

      {activeTab === "map" && (
        <div className="flex flex-col items-start gap-4 w-full px-4 sm:px-6">
          <h2 className="text-black font-outfit text-2xl font-medium leading-[120%]">
            {userDetails.user.username}'s Travel Map
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
            <p>{userDetails.user.username}'s travel map will appear here!</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
