 "use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { userService, postService, journeyService } from "@/lib/services/service-factory";
import { UserDetailsData, RecentPost } from "@/types/user.types";
import { convertRecentJourneysToJourneys } from "@/utils/journey.utils";
import { Journey } from "@/types/journey.types";
import { useAuthStore } from "@/store/auth.store";
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
  const { user: currentUser } = useAuthStore();
  const isViewingOwnProfile = currentUser?.id === userId;
  
  const [userDetails, setUserDetails] = useState<UserDetailsData | null>(null);
  const [allJourneys, setAllJourneys] = useState<Journey[]>([]);
  const [allPosts, setAllPosts] = useState<RecentPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingJourneys, setIsLoadingJourneys] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'journey' | 'post' | 'map'>('journey');

  // Load user details
  useEffect(() => {
    const loadUserDetails = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      setShowSkeleton(true);
      setError(null);
      
      try {
        const response = await userService.getUserDetails(userId);
        
        // Log API response for debugging
        console.log("[API_USER_DETAILS_RESPONSE]", {
          statusCode: response.statusCode,
          recentJourneysCount: response.data?.recentJourneys?.length || 0,
          recentPostsCount: response.data?.recentPosts?.length || 0,
          statsJourneysCount: response.data?.stats?.journeysCount || 0,
          statsPostsCount: response.data?.stats?.postsCount || 0,
          response: response
        });
        
        if (response.statusCode === 10000) {
          setUserDetails(response.data);
          
          // Fetch ALL journeys and posts separately to bypass the 5-item limit
          // Check if we need to fetch more based on stats
          const needsMoreJourneys = (response.data?.stats?.journeysCount || 0) > (response.data?.recentJourneys?.length || 0);
          const needsMorePosts = (response.data?.stats?.postsCount || 0) > (response.data?.recentPosts?.length || 0);
          
          // Always try to fetch all journeys if there's a discrepancy, or if journey/map tab is active
          // This ensures we get all available journeys, not just the 5 from recentJourneys
          if (needsMoreJourneys || activeTab === 'journey' || activeTab === 'map' || response.data?.stats?.journeysCount > 5) {
            setIsLoadingJourneys(true);
            try {
              console.log("[FETCHING_ALL_JOURNEYS]", {
                userId,
                isViewingOwnProfile,
                statsCount: response.data?.stats?.journeysCount,
                recentCount: response.data?.recentJourneys?.length
              });
              
              if (isViewingOwnProfile) {
                // For own profile, fetch ALL journeys using getMyJourneys (no limit)
                const allJourneysData = await journeyService.getMyJourneys({ limit: undefined, offset: undefined });
                setAllJourneys(allJourneysData);
                
                console.log("[STATE_JOURNEYS_COUNT_OWN_PROFILE]", {
                  count: allJourneysData.length,
                  journeys: allJourneysData
                });
              } else {
                // For other users, fetch all public journeys and filter by userId
                // This is a workaround since there's no public endpoint for user-specific journeys
                try {
                  console.log("[ATTEMPTING_TO_FETCH_ALL_JOURNEYS_FOR_USER]", { userId });
                  const allPublicJourneys = await journeyService.getAllJourneys({ limit: undefined, offset: undefined });
                  
                  console.log("[ALL_PUBLIC_JOURNEYS_RECEIVED]", {
                    totalCount: allPublicJourneys.length,
                    sampleUserIds: allPublicJourneys.slice(0, 5).map(j => j.user?.id)
                  });
                  
                  const userJourneys = allPublicJourneys.filter(journey => {
                    const matches = journey.user?.id === userId;
                    if (matches) {
                      console.log("[FOUND_MATCHING_JOURNEY]", { journeyId: journey.id, userId: journey.user?.id });
                    }
                    return matches;
                  });
                  
                  console.log("[FILTERING_RESULT]", {
                    targetUserId: userId,
                    filteredCount: userJourneys.length,
                    statsCount: response.data?.stats?.journeysCount
                  });
                  
                  // Always use filtered journeys if we found any, even if less than stats count
                  // (some journeys might be private and not in public list)
                  if (userJourneys.length > 0) {
                    setAllJourneys(userJourneys);
                    console.log("[STATE_JOURNEYS_COUNT_OTHER_USER_FILTERED]", {
                      count: userJourneys.length,
                      statsCount: response.data?.stats?.journeysCount,
                      allPublicJourneysCount: allPublicJourneys.length,
                      discrepancy: (response.data?.stats?.journeysCount || 0) - userJourneys.length,
                      journeys: userJourneys
                    });
                  } else {
                    // No journeys found in public list - might be private journeys
                    // Use recentJourneys as fallback (limited to 5 by backend)
                    const convertedJourneys = convertRecentJourneysToJourneys(response.data.recentJourneys || []);
                    setAllJourneys(convertedJourneys);
                    console.warn("[STATE_JOURNEYS_COUNT_OTHER_USER_FALLBACK]", {
                      count: convertedJourneys.length,
                      statsCount: response.data?.stats?.journeysCount,
                      discrepancy: (response.data?.stats?.journeysCount || 0) - convertedJourneys.length,
                      reason: "No journeys found in public journeys list - may be private",
                      journeys: convertedJourneys
                    });
                  }
                } catch (filterError: any) {
                  // If getAllJourneys fails, use recentJourneys
                  console.error('[FAILED_TO_FETCH_ALL_JOURNEYS]', {
                    error: filterError,
                    message: filterError?.message,
                    stack: filterError?.stack
                  });
                  const convertedJourneys = convertRecentJourneysToJourneys(response.data.recentJourneys || []);
                  setAllJourneys(convertedJourneys);
                  console.warn("[STATE_JOURNEYS_COUNT_OTHER_USER_ERROR_FALLBACK]", {
                    count: convertedJourneys.length,
                    statsCount: response.data?.stats?.journeysCount,
                    error: filterError?.message
                  });
                }
              }
            } catch (err: any) {
              console.error('Failed to fetch journeys:', err);
              // Fallback to recentJourneys from response
              const convertedJourneys = convertRecentJourneysToJourneys(response.data?.recentJourneys || []);
              setAllJourneys(convertedJourneys);
            } finally {
              setIsLoadingJourneys(false);
            }
          } else {
            // Still set journeys from response even if we don't need to fetch more
            const convertedJourneys = convertRecentJourneysToJourneys(response.data?.recentJourneys || []);
            setAllJourneys(convertedJourneys);
            console.log("[STATE_JOURNEYS_COUNT_INITIAL]", {
              count: convertedJourneys.length,
              statsCount: response.data?.stats?.journeysCount,
              discrepancy: (response.data?.stats?.journeysCount || 0) - convertedJourneys.length
            });
          }
          
          // Always ensure journeys are set, even if fetching failed
          if (allJourneys.length === 0 && response.data?.recentJourneys?.length > 0) {
            const convertedJourneys = convertRecentJourneysToJourneys(response.data.recentJourneys);
            setAllJourneys(convertedJourneys);
            console.log("[STATE_JOURNEYS_COUNT_FINAL_FALLBACK]", {
              count: convertedJourneys.length,
              statsCount: response.data?.stats?.journeysCount
            });
          }
          
          if (needsMorePosts || activeTab === 'post') {
            setIsLoadingPosts(true);
            try {
              // Fetch ALL posts - pass a very large limit to get all posts (backend doesn't support unlimited)
              // Using 1000 as a reasonable upper bound that should cover all user posts
              const postsResponse = await postService.getPostsByUser(userId, { limit: 1000, offset: 0 });
              
              console.log("[API_POSTS_RESPONSE]", {
                userId,
                statusCode: postsResponse.statusCode,
                postsCount: postsResponse.data?.length || 0,
                posts: postsResponse.data
              });
              
              if (postsResponse.data) {
                // Convert Post[] to RecentPost[] format
                const recentPosts: RecentPost[] = postsResponse.data.map(post => ({
                  id: post.id,
                  description: post.description || '',
                  likeCount: post.likeCount || 0,
                  commentCount: post.commentCount || 0,
                  createdAt: post.createdAt,
                  mediaUrls: post.media?.map(m => m.url) || []
                }));
                
                setAllPosts(recentPosts);
                
                console.log("[STATE_POSTS_COUNT]", {
                  count: recentPosts.length,
                  posts: recentPosts
                });
              }
            } catch (err: any) {
              console.error('Failed to fetch posts:', err);
              // Fallback to recentPosts from userDetails
              setAllPosts(response.data.recentPosts || []);
            } finally {
              setIsLoadingPosts(false);
            }
          } else {
            // Use recentPosts from userDetails if we don't need to fetch more
            setAllPosts(response.data.recentPosts || []);
          }
        } else {
          setError(response.message || 'Failed to load user details');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load user details');
      } finally {
        setIsLoading(false);
        // Hide skeleton after a short delay for smooth transition
        setTimeout(() => {
          setShowSkeleton(false);
        }, 300);
      }
    };

    loadUserDetails();
  }, [userId, activeTab]);

  // Log rendered journeys count when journeys change
  useEffect(() => {
    if (activeTab === 'journey' && allJourneys.length > 0) {
      console.log("[RENDER_JOURNEYS_COUNT]", {
        count: allJourneys.length,
        journeys: allJourneys
      });
    }
  }, [allJourneys, activeTab]);

  // Log rendered posts count when posts change
  useEffect(() => {
    if (activeTab === 'post' && allPosts.length > 0) {
      console.log("[RENDER_POSTS_COUNT]", {
        count: allPosts.length,
        posts: allPosts
      });
    }
  }, [allPosts, activeTab]);

  if (isLoading || showSkeleton) {
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
            {isLoadingJourneys ? (
              <div className="flex items-center justify-center py-8 w-full">
                <div className="text-gray-500">Loading journeys...</div>
              </div>
            ) : allJourneys.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 w-full">
                {allJourneys.map((journey, index) => (
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
          {isLoadingPosts ? (
            <div className="flex items-center justify-center py-8 w-full">
              <div className="text-gray-500">Loading posts...</div>
            </div>
          ) : (
            <UserPostsGrid 
              posts={allPosts}
              username={userDetails.user.username}
            />
          )}
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
