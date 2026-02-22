import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import DashboardFeed from '@/components/dashboard/DashboardFeed';
import { ApiError, ApiErrorCode } from '@/lib/api';
import type { Post } from '@/types/post.types';
import { HttpMethod } from '@/enums';

/**
 * Dashboard Page - Server Component
 *
 * Responsibilities:
 * - Fetch initial posts server-side using DashboardApi
 * - Handle 401 errors by redirecting
 * - Pass initial data to client component
 *
 * MUST NOT:
 * - Use "use client" directive
 * - Use React Query (client-only)
 * - Use Zustand store (client-only)
 *
 * IMPORTANT: Server Components calling Route Handlers
 * - httpClient in DashboardApi uses credentials: 'include'
 * - In Server Components, we need to construct full URL and forward cookies manually
 * - For now, calling Route Handler directly with manual cookie forwarding
 * - TODO: Enhance httpClient to support Server Component context
 */
async function fetchInitialPosts(): Promise<Post[]> {
  try {
    // Get cookies from the incoming request
    // CRITICAL: In Next.js 15+, cookies() returns a Promise
    const cookieStore = await cookies();

    // Check if we have auth cookies
    const accessToken = cookieStore.get('viargos_access_token');
    if (!accessToken) {
      return [];
    }

    // Build cookie header for manual forwarding
    const cookieHeader = cookieStore.toString();

    // In Server Components, call Route Handler with relative path
    // Cookies must be manually forwarded since fetch() in Node.js doesn't auto-include them
    // TODO: Enhance httpClient to support Server Component context with cookie forwarding
    const routeHandlerUrl = `/api/dashboard?limit=10`;

    // Call Route Handler directly with manual cookie forwarding
    // Route returns normalized { posts, nextCursor, hasMore }; we use domain type Post[] only
    const baseURL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3001';
    const response = await fetch(`${baseURL}${routeHandlerUrl}`, {
      method: HttpMethod.GET,
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
      cache: 'no-store',
    });

    if (response.status === 401) {
      redirect('/?session=expired');
    }

    if (!response.ok) {
      console.error('Failed to fetch dashboard posts:', response.statusText);
      return [];
    }

    const data = await response.json();
    return (data.posts ?? []) as Post[];
  } catch (error) {
    // Handle 401 - redirect to home (which will show login modal)
    if (error instanceof ApiError && error.is(ApiErrorCode.UNAUTHORIZED)) {
      redirect('/?session=expired');
    }

    // Handle other errors - return empty array
    console.error('Failed to fetch dashboard posts:', error);
    return [];
  }
}

export default async function DashboardPage() {
  // Fetch initial posts server-side
  const initialPosts = await fetchInitialPosts();

  return (
    <div className="flex-1 p-4 sm:p-6 w-full flex justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-6xl flex flex-col min-h-full">
        <div className="flex justify-center items-center flex-1 w-full">
          <DashboardFeed initialData={initialPosts} />
        </div>
      </div>
    </div>
  );
}
