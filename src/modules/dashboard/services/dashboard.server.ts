import type { DashboardFeedDto } from '@/modules/dashboard/dto/dashboard.dto';
import type { DashboardFeedModel } from '@/modules/dashboard/types/dashboard.types';
import { cookies } from 'next/headers';
import { getAppUrl } from '@/lib/app-config';
import { unwrapEnvelope } from '@/modules/common/mappers';
import { DASHBOARD_DEFAULT_LIMIT } from '@/modules/dashboard/constants/dashboard.constants';
import { mapDashboardFeed } from '@/modules/dashboard/mappers/dashboard.mapper';

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? getAppUrl();
}

const DASHBOARD_INITIAL_FEED_TIMEOUT_MS = 8000;

export class DashboardUnauthorizedError extends Error {
  public constructor() {
    super('DASHBOARD_UNAUTHORIZED');
    this.name = 'DashboardUnauthorizedError';
  }
}

function buildInitialFeedUrl(): string {
  const params = new URLSearchParams();
  params.set('limit', String(DASHBOARD_DEFAULT_LIMIT));

  return `${getBaseUrl()}/api/dashboard?${params.toString()}`;
}

export async function getInitialDashboardFeed(): Promise<DashboardFeedModel | null> {
  try {
    const cookieStore = await cookies();
    const response = await fetch(buildInitialFeedUrl(), {
      cache: 'no-store',
      credentials: 'include',
      headers: {
        cookie: cookieStore.toString(),
      },
      method: 'GET',
      signal: AbortSignal.timeout(DASHBOARD_INITIAL_FEED_TIMEOUT_MS),
    });

    if (response.status === 401) {
      throw new DashboardUnauthorizedError();
    }

    if (!response.ok) {
      return null;
    }

    const payload: unknown = await response.json().catch(() => null);
    const dto = unwrapEnvelope<DashboardFeedDto>(payload).data;
    return mapDashboardFeed(dto);
  } catch (error) {
    if (error instanceof DashboardUnauthorizedError) {
      throw error;
    }

    return null;
  }
}
