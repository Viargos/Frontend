"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import AuthModal from "@/components/auth/AuthModal";
import { useState } from "react";

export default function Home() {
  const { user, isAuthenticated, getProfile } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated on mount
    const token = localStorage.getItem("token");
    if (token && !user) {
      getProfile();
    }
  }, [getProfile, user]);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show unauthenticated layout (landing page)
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Top Header */}
        <header className="flex justify-between items-center w-full p-4 bg-white border-b border-gray-200">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3">
              V
            </div>
            <h1 className="text-2xl font-bold text-gray-900">viargos</h1>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </header>

        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Discover Amazing Journeys
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Share your travel experiences and explore incredible
                destinations with the Viargos community.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </button>
                <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                  Learn More
                </button>
              </div>
            </div>

            {/* Main Content Layout */}
            <div className="flex gap-6 lg:gap-8">
              {/* Main Journey Gallery */}
              <div className="flex-1 max-w-3xl">
                {/* Sample Content */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Featured Journeys
                  </h2>
                  <div className="text-center text-gray-500 py-8">
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
                    <p>
                      Join Viargos to see amazing journeys from around the
                      world!
                    </p>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="hidden lg:block w-80 flex-shrink-0">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Popular Journeys
                  </h2>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            Dubai Trip
                          </h3>
                          <div className="flex items-center text-xs text-gray-500 space-x-2 mt-1">
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span>Dubai</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500 space-x-2 mt-1">
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span>15 Jan • 17 Jan</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
