import type { DashboardParityState } from '@/modules/dashboard/constants/dashboard-parity.types';
import type {
  DashboardFeedModel,
  DashboardJourneyRecommendation,
  DashboardProfileRecommendation,
} from '@/modules/dashboard/types/dashboard.types';

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

const FIXTURE_RECOMMENDATIONS: DashboardProfileRecommendation[] = [
  {
    id: 'r1',
    username: 'maya.chen',
    descriptor: 'Travel creator sharing slow living itineraries.',
    followersCount: 24800,
    postsCount: 42,
    isFollowing: false,
    category: 'Travel',
  },
  {
    id: 'r2',
    username: 'arjun.patel',
    descriptor: 'AI builder shipping practical tools every week.',
    followersCount: 12100,
    postsCount: 31,
    isFollowing: false,
    category: 'AI / Tech',
  },
  {
    id: 'r3',
    username: 'sofia.hart',
    descriptor: 'Fitness coach focused on habit-first wellness.',
    followersCount: 9600,
    postsCount: 27,
    isFollowing: false,
    category: 'Fitness',
  },
  {
    id: 'r4',
    username: 'nomad.alex',
    descriptor: 'Documenting remote work, city guides, and route ideas.',
    followersCount: 8100,
    postsCount: 19,
    isFollowing: false,
    category: 'Travel',
  },
  {
    id: 'r5',
    username: 'lina.gomez',
    descriptor: 'Tech operator writing about product systems and teams.',
    followersCount: 6400,
    postsCount: 15,
    isFollowing: false,
    category: 'AI / Tech',
  },
];

const FIXTURE_POPULAR_JOURNEYS: DashboardJourneyRecommendation[] = [
  {
    id: 'dj1',
    title: 'South India Temple Trail',
    description: 'A compact cultural route through temple cities and local food stops.',
    creator: {
      id: 'u1',
      username: 'maya.chen',
    },
    daysCount: 4,
    placesCount: 11,
    createdAt: '2026-01-14T14:00:00.000Z',
  },
  {
    id: 'dj2',
    title: 'Bali Workation Loop',
    description: 'Remote-work-friendly cafes, surf mornings, and relaxed evenings.',
    creator: {
      id: 'u2',
      username: 'arjun.patel',
    },
    daysCount: 6,
    placesCount: 14,
    createdAt: '2026-01-15T14:00:00.000Z',
  },
  {
    id: 'dj3',
    title: 'Tokyo Weekend Sprint',
    description: 'Fast-paced neighborhoods, ramen spots, and late-night city views.',
    creator: {
      id: 'u3',
      username: 'sofia.hart',
    },
    daysCount: 3,
    placesCount: 9,
    createdAt: '2026-01-16T14:00:00.000Z',
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

export function getDashboardRecommendationParityFixture(): DashboardProfileRecommendation[] {
  return FIXTURE_RECOMMENDATIONS;
}

export function getDashboardPopularJourneyParityFixture(): DashboardJourneyRecommendation[] {
  return FIXTURE_POPULAR_JOURNEYS;
}
