import type { DashboardParityState } from '@/modules/dashboard/constants/dashboard-parity.types';
import type { DashboardFeedModel } from '@/modules/dashboard/types/dashboard.types';

const FIXTURE_POSTS: DashboardFeedModel['posts'] = [
  {
    id: 'p1',
    description: 'Short text post.',
    likeCount: 3,
    commentCount: 1,
    location: 'Mumbai',
    createdAt: '2026-01-10T10:00:00.000Z',
    isLikedByCurrentUser: false,
    user: {
      id: '00000000-0000-0000-0000-000000000001',
      username: 'Parity User',
    },
    media: [],
  },
  {
    id: 'p2',
    description:
      'Long text post with multiple lines to validate wrapping behavior in dashboard cards across breakpoints and ensure typography parity under constrained widths.',
    likeCount: 8,
    commentCount: 2,
    location: 'Goa',
    createdAt: '2026-01-11T11:00:00.000Z',
    isLikedByCurrentUser: true,
    user: {
      id: '00000000-0000-0000-0000-000000000001',
      username: 'Parity User',
    },
    media: [],
  },
  {
    id: 'p3',
    description: 'Single image post.',
    likeCount: 12,
    commentCount: 4,
    location: 'Pune',
    createdAt: '2026-01-12T12:00:00.000Z',
    isLikedByCurrentUser: false,
    user: {
      id: '00000000-0000-0000-0000-000000000001',
      username: 'Parity User',
    },
    media: [
      {
        id: 'm1',
        kind: 'image',
        url: 'https://picsum.photos/seed/parity-1/1200/800',
        thumbnailUrl: 'https://picsum.photos/seed/parity-1/600/400',
      },
    ],
    journey: {
      id: 'j1',
      title: 'Western Ghats',
    },
  },
  {
    id: 'p4',
    description: 'Multi media post for grid/carousel parity.',
    likeCount: 21,
    commentCount: 9,
    location: 'Delhi',
    createdAt: '2026-01-13T13:00:00.000Z',
    isLikedByCurrentUser: true,
    user: {
      id: '00000000-0000-0000-0000-000000000001',
      username: 'Parity User',
    },
    media: [
      {
        id: 'm2',
        kind: 'image',
        url: 'https://picsum.photos/seed/parity-2/1200/800',
        thumbnailUrl: 'https://picsum.photos/seed/parity-2/600/400',
      },
      {
        id: 'm3',
        kind: 'image',
        url: 'https://picsum.photos/seed/parity-3/1200/800',
        thumbnailUrl: 'https://picsum.photos/seed/parity-3/600/400',
      },
      {
        id: 'm4',
        kind: 'video',
        url: 'https://example.com/fake-video.mp4',
        thumbnailUrl: 'https://picsum.photos/seed/parity-4/600/400',
      },
    ],
    journey: {
      id: 'j2',
      title: 'City Trip',
    },
  },
];

export function getDashboardParityFixture(state: DashboardParityState): DashboardFeedModel {
  if (state === 'empty' || state === 'loading' || state === 'error') {
    return {
      posts: [],
      hasMore: false,
      totalCount: 0,
    };
  }

  return {
    posts: FIXTURE_POSTS,
    hasMore: state === 'pagination',
    nextCursor: state === 'pagination' ? 'cursor-1' : undefined,
    totalCount: FIXTURE_POSTS.length,
  };
}
