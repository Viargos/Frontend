"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useJourneyStore } from "@/store/journey.store";
import { useRouter } from "next/navigation";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import UserStats from "../../components/UserStats";
import ProfileActions from "../../components/ProfileActions";
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
    <AuthenticatedLayout>
      <div className="flex flex-col items-start gap-6 flex-1 w-full max-w-4xl mx-auto">
        {/* Profile Header Card */}
        <div className="flex flex-col justify-center items-start -gap-12 w-full rounded-md bg-white shadow-lg overflow-hidden">
          {/* Hero Background Image */}
          <Image
            src="/london.png?format=webp&width=800"
            alt="Profile background"
            className="h-[270px] w-full object-cover"
            width={50}
            height={50}
          />

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
                {/* Avatar Image - using user's first initial */}
                <div className="w-30 h-30 rounded-lg absolute left-0 top-0 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </div>
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
        <ProfileActions />

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
              <Button variant="primary" size="lg">
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
    </AuthenticatedLayout>
  );
}
