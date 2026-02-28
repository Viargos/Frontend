import type { UserProfileResponseDto } from '@/modules/profile/dto/profile.dto';
import type { UserProfile } from '@/modules/profile/types/profile.types';

export function mapUserProfile(dto: UserProfileResponseDto): UserProfile {
  if (!dto.user || typeof dto.user.id !== 'string' || typeof dto.user.username !== 'string') {
    throw new Error('Invalid user profile response payload');
  }

  return {
    recentJourneys: (dto.recentJourneys ?? []).map(journey => ({
      coverImage: journey.coverImage,
      createdAt: journey.createdAt,
      daysCount: journey.daysCount,
      description: journey.description,
      id: journey.id,
      previewPlaces: journey.previewPlaces,
      title: journey.title,
    })),
    recentPosts: (dto.recentPosts ?? []).map(post => ({
      commentCount: post.commentCount,
      createdAt: post.createdAt,
      description: post.description,
      id: post.id,
      likeCount: post.likeCount,
      mediaUrls: post.mediaUrls,
    })),
    relationship: {
      isFollowedBy: dto.relationshipStatus.isFollowedBy,
      isFollowing: dto.relationshipStatus.isFollowing,
    },
    stats: {
      followers: dto.stats.followersCount,
      following: dto.stats.followingCount,
      journeys: dto.stats.journeysCount,
      posts: dto.stats.postsCount,
    },
    user: {
      bannerImage: dto.user.bannerImage ?? undefined,
      bio: dto.user.bio,
      createdAt: dto.user.createdAt,
      email: dto.user.email,
      id: dto.user.id,
      location: dto.user.location,
      profileImage: dto.user.profileImage ?? undefined,
      username: dto.user.username,
    },
  };
}
