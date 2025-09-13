"use client";

import React from "react";
import { motion } from "framer-motion";
import Header from "@/components/home/Header";
import ModalContainer from "@/components/auth/ModalContainer";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import GuestPostsList from "@/components/post/GuestPostsList";
import { useAuthStore } from "@/store/auth.store";

export default function ExplorePage() {
  const { user, openSignup, openLogin } = useAuthStore();

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Top Header */}
        <Header user={user} />

        <div className="p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Explore Amazing Journeys
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover incredible travel experiences, breathtaking
                destinations, and inspiring stories from travelers around the
                world.
              </p>
            </motion.div>

            {/* Feature Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Discover Destinations
                </h3>
                <p className="text-sm text-gray-600">
                  Explore hidden gems and popular destinations worldwide
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Connect with Travelers
                </h3>
                <p className="text-sm text-gray-600">
                  Join a community of passionate travel enthusiasts
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Share Your Story
                </h3>
                <p className="text-sm text-gray-600">
                  Document and share your own travel adventures
                </p>
              </div>
            </motion.div>

            {/* Posts Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      Featured Travel Posts
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Get inspired by amazing travel experiences
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={openSignup}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Join Now
                    </button>
                    <button
                      onClick={openLogin}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              </div>

              {/* Guest Posts List - Show more posts on explore page */}
              <GuestPostsList maxPosts={10} />
            </motion.div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center text-white mt-12"
            >
              <h3 className="text-2xl font-bold mb-4">
                Ready to Start Your Journey?
              </h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Join thousands of travelers sharing their experiences,
                discovering new destinations, and connecting with fellow
                adventurers from around the globe.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={openSignup}
                  className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                >
                  Create Free Account
                </button>
                <button
                  onClick={openLogin}
                  className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold"
                >
                  Sign In
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Auth Modal */}
        <ModalContainer />
      </div>
    </ErrorBoundary>
  );
}
