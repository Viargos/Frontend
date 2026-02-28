import type { UserProfile } from '@/modules/profile/types/profile.types';

export function getProfileParityFixture(): UserProfile {
  return {
    recentJourneys: [
      {
        coverImage: '/london.png',
        createdAt: '2026-02-10T10:00:00.000Z',
        daysCount: 3,
        description: 'City walk and food spots',
        id: 'journey-profile-1',
        previewPlaces: ['Big Ben', 'Tower Bridge', 'Covent Garden'],
        title: 'London Weekend',
      },
    ],
    recentPosts: [
      {
        commentCount: 5,
        createdAt: '2026-02-11T09:00:00.000Z',
        description: 'Great trip and amazing weather.',
        id: 'post-profile-1',
        likeCount: 12,
        mediaUrls: ['/london.png'],
      },
    ],
    relationship: {
      isFollowedBy: false,
      isFollowing: false,
    },
    stats: {
      followers: 10,
      following: 8,
      journeys: 1,
      posts: 1,
    },
    user: {
      bannerImage: '',
      bio: 'Traveler',
      createdAt: '2026-01-01T00:00:00.000Z',
      email: 'parity@example.com',
      id: 'user-profile-1',
      location: 'London',
      profileImage: '',
      username: 'Parity User',
    },
  };
}
