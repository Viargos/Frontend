import { PageLoading } from '@/components/common';

/**
 * Loading UI for dashboard routes
 * This is shown automatically by Next.js while the route is loading
 * Works with Suspense boundaries
 */
export default function Loading() {
  return <PageLoading text="Loading..." />;
}
