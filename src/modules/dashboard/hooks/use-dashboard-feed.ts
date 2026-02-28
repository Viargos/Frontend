'use client';

import type { DashboardFeedModel } from '@/modules/dashboard/types/dashboard.types';
import { useDashboardPosts } from './use-dashboard-posts';

export function useDashboardFeed(initialFeed: DashboardFeedModel | null) {
  return useDashboardPosts(initialFeed);
}
