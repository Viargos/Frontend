"use client";

import PostsList from "@/components/post/PostsList";

/**
 * Dashboard Page - Main authenticated user dashboard
 * This page is automatically wrapped by the DashboardLayout
 * which handles authentication and provides the AuthenticatedLayout
 */
export default function DashboardPage() {
  return (
    <div className="flex-1 p-4 sm:p-6 max-w-none">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Home</h1>
          <p className="text-gray-600">
            Discover amazing travel experiences from the community
          </p>
        </div>

        {/* Posts Feed */}
        <PostsList />
      </div>
    </div>
  );
}
