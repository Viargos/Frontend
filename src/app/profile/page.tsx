"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useJourneyStore } from "@/store/journey.store";
import { useRouter } from "next/navigation";
import ProfileLayout from "@/components/layout/ProfileLayout";
import NewJourneyModal from "@/components/journey/NewJourneyModal";
import UserStats from "../../components/UserStats";

import JourneyCard from "../../components/JourneyCard";
import Button from "@/components/ui/Button";
import Image from "next/image";
import apiClient from "@/lib/api";

export default function ProfilePage() {
  const { user, isAuthenticated, getProfile } = useAuthStore();
  const {
    journeys: userJourneys,
    fetchMyJourneys,
    isLoading: journeysLoading,
  } = useJourneyStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"journey" | "post" | "map">(
    "journey"
  );
  const [userStats, setUserStats] = useState({
    posts: 0,
    journeys: 0,
    followers: 0,
    following: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(null);
  const [isNewJourneyModalOpen, setIsNewJourneyModalOpen] = useState(false);

  useEffect(() => {
    // Check if user is authenticated on mount
    const token = localStorage.getItem("token");
    if (token && !user) {
      getProfile();
    }
  }, [getProfile, user]);

  // Fetch user journeys and stats when user is authenticated
  useEffect(() => {
    if (user && isAuthenticated) {
      fetchMyJourneys();
      fetchUserStats();
      fetchImageUrls();
    }
  }, [user, isAuthenticated, fetchMyJourneys]);

  const fetchUserStats = async () => {
    if (!user) return;

    setStatsLoading(true);
    try {
      const response = await apiClient.getCurrentUserStats();
      if (response.data) {
        setUserStats(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchImageUrls = async () => {
    if (!user) return;

    try {
      // Use direct S3 URLs since images are now public
      if (user.profileImage) {
        setProfileImageUrl(user.profileImage);
      }

      if (user.bannerImage) {
        setBannerImageUrl(user.bannerImage);
      }
    } catch (error) {
      console.error("Failed to set image URLs:", error);
    }
  };

  const handleProfileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      const response = await apiClient.uploadProfileImage(file);
      if (response.data) {
        // Update the user profile with new image URL
        await getProfile();
        // Set the new image URL directly since it's public
        setProfileImageUrl(response.data.imageUrl);
      }
    } catch (error) {
      console.error("Failed to upload profile image:", error);
    }
  };

  const handleBannerUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      const response = await apiClient.uploadBannerImage(file);
      if (response.data) {
        // Update the user profile with new image URL
        await getProfile();
        // Set the new image URL directly since it's public
        setBannerImageUrl(response.data.imageUrl);
      }
    } catch (error) {
      console.error("Failed to upload banner image:", error);
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
    console.log("Creating journey:", journeyData);
    // TODO: Create journey via API
    setIsNewJourneyModalOpen(false);

    // Store location data in sessionStorage for the journey details page
    if (journeyData.locationData) {
      sessionStorage.setItem(
        "journeyLocationData",
        JSON.stringify(journeyData.locationData)
      );
    }

    // Navigate to journey details page
    router.push(`/journey/new`);
  };

  // Redirect unauthenticated users to home
  useEffect(() => {
    if (isAuthenticated === false) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // Show loading state while checking authentication
  if (isAuthenticated === null || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  // Transform backend journey data to match JourneyCard component interface
  const transformedJourneys = userJourneys.map((journey) => ({
    id: journey.id,
    image: "/image.png?format=webp&width=400", // Default image for now
    imageAlt: `${journey.title} journey`,
    dateRange:
      journey.days && journey.days.length > 0
        ? `${journey.days[0].date} • ${
            journey.days[journey.days.length - 1].date
          }`
        : "No dates set",
    title: journey.title,
    location: journey.days?.[0]?.places?.[0]?.location || "Location not set",
    status: "completed" as const, // Default status
    highlight: journey.description || "No description",
  }));

  return (
    <ProfileLayout>
      <div className="flex flex-col items-start gap-6 flex-1 w-full max-w-4xl mx-auto">
        {/* Profile Header Card */}
        <div className="flex flex-col justify-center items-start -gap-12 w-full rounded-md bg-white shadow-lg overflow-hidden">
          {/* Hero Background Image */}
          <div className="relative h-[270px] w-full">
            {bannerImageUrl ? (
              <Image
                src={bannerImageUrl}
                alt="Profile background"
                className="h-[270px] w-full object-cover"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
              />
            ) : (
              <Image
                src="/london.png?format=webp&width=800"
                alt="Profile background"
                className="h-[270px] w-full object-cover"
                width={800}
                height={270}
              />
            )}
            {/* Banner Upload Button */}
            <button
              onClick={() => document.getElementById("banner-upload")?.click()}
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-md text-sm hover:bg-white/30 transition-colors"
            >
              Change Banner
            </button>
            <input
              id="banner-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerUpload}
            />
          </div>

          {/* Avatar and Stats Section */}
          <div className="flex h-48 pb-6 px-6 items-end gap-20 w-full -mt-12">
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
                    {user?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                {/* Profile Upload Button */}
                <button
                  onClick={() =>
                    document.getElementById("profile-upload")?.click()
                  }
                  className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                >
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
                </button>
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileUpload}
                />
              </div>

              {/* Name */}
              <h1 className="text-heading font-mulish text-[22px] font-bold leading-7">
                {user?.username || "User"}
              </h1>
            </div>

            {/* Stats */}
            <div className="flex items-start gap-20 flex-1 pb-6">
              {statsLoading ? (
                <div className="flex items-center gap-4">
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                </div>
              ) : (
                <UserStats
                  posts={userStats.posts.toString()}
                  journeys={userStats.journeys.toString()}
                  followers={
                    userStats.followers >= 1000
                      ? `${(userStats.followers / 1000).toFixed(1)} K`
                      : userStats.followers.toString()
                  }
                  following={userStats.following.toString()}
                />
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {/* <ProfileActions /> */}

        {/* Profile Navigation Tabs */}
        <div className="flex items-center gap-8 w-full border-b border-gray-200">
          <button
            onClick={() => setActiveTab("journey")}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === "journey"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Journey
          </button>
          <button
            onClick={() => setActiveTab("post")}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === "post"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Post
          </button>
          <button
            onClick={() => setActiveTab("map")}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === "map"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Map
          </button>
        </div>

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
              {journeysLoading ? (
                <div className="w-full text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading journeys...</p>
                </div>
              ) : transformedJourneys.length > 0 ? (
                transformedJourneys.map((journey) => (
                  <JourneyCard
                    key={journey.id}
                    image={journey.image}
                    imageAlt={journey.imageAlt}
                    dateRange={journey.dateRange}
                    title={journey.title}
                    location={journey.location}
                    status={journey.status}
                    highlight={journey.highlight}
                  />
                ))
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
                    No journeys yet. Create your first journey!
                  </p>
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
      </div>

      {/* New Journey Modal */}
      <NewJourneyModal
        isOpen={isNewJourneyModalOpen}
        onClose={() => setIsNewJourneyModalOpen(false)}
        onSubmit={handleCreateJourney}
      />
    </ProfileLayout>
  );
}
