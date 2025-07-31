"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";

export default function JourneysPage() {
  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Journeys
            </h1>
            <p className="text-gray-600">
              Manage and create your travel journeys
            </p>
          </div>

          {/* Create Journey Button */}
          <div className="mb-8">
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              <svg
                className="w-5 h-5 mr-2"
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
              Create New Journey
            </button>
          </div>

          {/* Journeys Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Empty State */}
            <div className="col-span-full">
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No journeys yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Start creating your first journey to share your travel
                  experiences.
                </p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Create Your First Journey
                </button>
              </div>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}
