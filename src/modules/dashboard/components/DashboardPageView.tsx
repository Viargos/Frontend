import type { DashboardParityState } from '../constants/dashboard-parity.types';
import type { DashboardFeedModel } from '../types/dashboard.types';
import { redirect } from 'next/navigation';
import { getDashboardParityFixture } from '../constants/dashboard-parity.fixtures';
import { DashboardUnauthorizedError, getInitialDashboardFeed } from '../services/dashboard.server';
import { DashboardFeed } from './DashboardFeed';

type DashboardPageViewProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function DashboardPageView(props: DashboardPageViewProps) {
  const searchParams = await props.searchParams;
  const parityEnabled = process.env.PARITY === 'true' && searchParams.parityFixtures === '1';
  const parityState: DashboardParityState = typeof searchParams.parityState === 'string' ? searchParams.parityState as DashboardParityState : 'feed';
  let initialFeed: DashboardFeedModel | null = null;

  if (parityEnabled) {
    initialFeed = getDashboardParityFixture(parityState);
  } else {
    try {
      initialFeed = await getInitialDashboardFeed();
    } catch (error) {
      if (error instanceof DashboardUnauthorizedError) {
        redirect('/');
      }
      throw error;
    }
  }

  if (parityEnabled && parityState === 'loading') {
    return (
      <div className="flex min-h-[calc(100vh-250px)] w-full items-center justify-center py-20">
        <div aria-busy="true" className="text-center" role="status">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
          <span className="sr-only">Fetching dashboard feed</span>
        </div>
      </div>
    );
  }

  if (parityEnabled && parityState === 'error') {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="mb-3 text-red-600">Failed to load posts</p>
          <button className="rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700" type="button">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] w-full flex-1 p-4 sm:p-6">
      <DashboardFeed initialFeed={initialFeed} parityState={parityEnabled ? parityState : undefined} />
    </div>
  );
}
