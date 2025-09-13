"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import Header from "@/components/home/Header";
import ModalContainer from "@/components/auth/ModalContainer";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import GuestPostsList from "@/components/post/GuestPostsList";

export default function Home() {
  const { user, isAuthenticated, openSignup, openLogin } = useAuthStore();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  // Show unauthenticated layout (landing page)
  return (
    <ErrorBoundary>
      <>
        <div className="min-h-screen bg-gray-50">
          {/* Top Header */}
          <Header user={user} />

          <div className="p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
              {/* Hero Section */}
              <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-8">
                <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">
                  Discover Amazing Journeys
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 mb-6">
                  Share your travel experiences and explore incredible
                  destinations with the Viargos community.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={openSignup}
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    Get Started
                  </button>
                  <button
                    onClick={openLogin}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
                  >
                    Sign In
                  </button>
                </div>
              </div>

              {/* Main Content Layout */}
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Main Journey Gallery */}
                <div className="max-w-7xl mx-auto">
                  <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                      Latest Posts
                    </h2>
                    <p className="text-gray-600 mb-4 text-center">
                      Discover amazing travel experiences from our community
                    </p>
                  </div>

                  {/* Guest Posts List */}
                  <GuestPostsList maxPosts={10} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Modal */}
        <ModalContainer />
      </>
    </ErrorBoundary>
  );
}
