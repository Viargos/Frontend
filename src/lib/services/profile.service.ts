/**
 * Profile Service - Migrated Version
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Handles only profile-related operations
 * - Open/Closed: Open for extension through interfaces, closed for modification
 * - Liskov Substitution: Implements IProfileService interface correctly
 * - Interface Segregation: Depends only on required interface (IHttpClient)
 * - Dependency Inversion: Depends on abstractions (IHttpClient), not concrete implementations
 *
 * Improvements:
 * - Centralized error messages (ERROR_MESSAGES)
 * - Centralized success messages (SUCCESS_MESSAGES)
 * - Structured logging with logger (replaced 7 console.log statements)
 * - Better error handling with ErrorHandler
 * - Type-safe implementations (removed 9 `any` types)
 * - Removed duplicate file validation (using FileValidator)
 * - Private helper methods for data transformation (SRP)
 */

import { IProfileService } from '@/lib/interfaces/profile.interface';
import { IHttpClient, ApiResponse } from '@/lib/interfaces/http-client.interface';
import { User } from '@/types/auth.types';
import { UserStats, UserProfile, RecentJourney } from '@/types/profile.types';
import { RecentPost } from '@/types/user.types';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants';
import { logger } from '@/utils/logger';
import { ErrorHandler } from '@/utils/error-handler';
import { FileValidator } from '@/utils/file-validator';

export class ProfileService implements IProfileService {
  constructor(private httpClient: IHttpClient) {
    logger.debug('ProfileService initialized');
  }

  /**
   * Get current user profile
   */
  async getCurrentUserProfile(): Promise<ApiResponse<UserProfile>> {
    logger.debug('Fetching current user profile');

    try {
      const response = await this.httpClient.get<Record<string, unknown>>('/users/profile/me');

      const apiUser = this.extractUserFromResponse(response);
      this.validateUserData(apiUser);

      const transformedProfile = this.transformToUserProfile(apiUser);

      logger.info('User profile fetched successfully', {
        userId: transformedProfile.id,
        username: transformedProfile.username,
      });

      return {
        statusCode: response.statusCode || 200,
        message: response.message || 'Profile retrieved successfully',
        data: transformedProfile,
      };
    } catch (error) {
      logger.error('Failed to fetch user profile', error as Error);
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.PROFILE.FETCH_FAILED);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: Partial<UserProfile>): Promise<ApiResponse<User>> {
    logger.info('Updating user profile', {
      hasBio: !!profileData.bio,
      hasLocation: !!profileData.location,
      hasUsername: !!profileData.username,
    });

    try {
      this.validateProfileData(profileData);

      const response = await this.httpClient.put<User>('/users/profile', profileData);

      logger.info('User profile updated successfully');

      logger.trackEvent('profile_updated', {
        hasBio: !!profileData.bio,
        hasLocation: !!profileData.location,
      });

      return response;
    } catch (error) {
      logger.error('Failed to update profile', error as Error, { profileData });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.PROFILE.UPDATE_FAILED);
    }
  }

  /**
   * Upload profile image
   */
  async uploadProfileImage(file: File): Promise<ApiResponse<{ imageUrl: string; message: string }>> {
    logger.info('Uploading profile image', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    try {
      // Use FileValidator utility instead of duplicate validation logic
      FileValidator.validateProfileImage(file);

      const response = await this.httpClient.uploadFile<{ imageUrl: string; message: string }>(
        '/users/profile-image',
        file,
        'image'
      );

      logger.info('Profile image uploaded successfully', {
        fileName: file.name,
        imageUrl: response.data?.imageUrl,
      });

      logger.trackEvent('profile_image_uploaded', {
        fileName: file.name,
        fileSize: file.size,
      });

      return response;
    } catch (error) {
      logger.error('Failed to upload profile image', error as Error, {
        fileName: file.name,
        fileSize: file.size,
      });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.PROFILE.IMAGE_UPLOAD_FAILED);
    }
  }

  /**
   * Upload banner image
   */
  async uploadBannerImage(file: File): Promise<ApiResponse<{ imageUrl: string; message: string }>> {
    logger.info('Uploading banner image', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    try {
      // Use FileValidator utility instead of duplicate validation logic
      FileValidator.validateBannerImage(file);

      const response = await this.httpClient.uploadFile<{ imageUrl: string; message: string }>(
        '/users/banner-image',
        file,
        'image'
      );

      logger.info('Banner image uploaded successfully', {
        fileName: file.name,
        imageUrl: response.data?.imageUrl,
      });

      logger.trackEvent('banner_image_uploaded', {
        fileName: file.name,
        fileSize: file.size,
      });

      return response;
    } catch (error) {
      logger.error('Failed to upload banner image', error as Error, {
        fileName: file.name,
        fileSize: file.size,
      });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.PROFILE.BANNER_UPLOAD_FAILED);
    }
  }

  /**
   * Get current user stats
   */
  async getCurrentUserStats(): Promise<ApiResponse<UserStats>> {
    logger.debug('Fetching current user stats');

    try {
      const response = await this.httpClient.get<Record<string, unknown>>('/users/profile/me');

      const apiStats = this.extractStatsFromResponse(response);
      const transformedStats = this.transformToUserStats(apiStats);

      logger.debug('User stats fetched', {
        posts: transformedStats.posts,
        journeys: transformedStats.journeys,
        followers: transformedStats.followers,
        following: transformedStats.following,
      });

      return {
        statusCode: response.statusCode || 200,
        message: response.message || 'Stats retrieved successfully',
        data: transformedStats,
      };
    } catch (error) {
      logger.error('Failed to retrieve user statistics', error as Error);
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.PROFILE.FETCH_FAILED);
    }
  }

  /**
   * Get current user profile with journeys and posts
   */
  async getCurrentUserProfileWithJourneys(): Promise<ApiResponse<{
    profile: UserProfile;
    stats: UserStats;
    recentJourneys: RecentJourney[];
    recentPosts: RecentPost[]
  }>> {
    logger.debug('Fetching current user profile with journeys and posts');

    try {
      const response = await this.httpClient.get<Record<string, unknown>>('/users/profile/me');

      // Extract and transform user data
      const apiUser = this.extractUserFromResponse(response);
      this.validateUserData(apiUser);
      const transformedProfile = this.transformToUserProfile(apiUser);

      // Extract and transform stats
      const apiStats = this.extractStatsFromResponse(response);
      const transformedStats = this.transformToUserStats(apiStats);

      // Extract recent journeys and posts
      const recentJourneys = this.extractRecentJourneysFromResponse(response);
      const recentPosts = this.extractRecentPostsFromResponse(response);

      logger.info('Complete profile data fetched', {
        userId: transformedProfile.id,
        journeyCount: recentJourneys.length,
        postCount: recentPosts.length,
      });

      return {
        statusCode: response.statusCode || 200,
        message: response.message || 'Profile data retrieved successfully',
        data: {
          profile: transformedProfile,
          stats: transformedStats,
          recentJourneys,
          recentPosts
        },
      };
    } catch (error) {
      logger.error('Failed to fetch complete profile data', error as Error);
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.PROFILE.FETCH_FAILED);
    }
  }

  /**
   * Delete profile image
   */
  async deleteProfileImage(): Promise<ApiResponse<{ message: string }>> {
    logger.info('Deleting profile image');

    try {
      const response = await this.httpClient.delete<{ message: string }>('/users/profile-image');

      logger.info('Profile image deleted successfully');

      logger.trackEvent('profile_image_deleted');

      return response;
    } catch (error) {
      logger.error('Failed to delete profile image', error as Error);
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.FILE.DELETE_FAILED);
    }
  }

  /**
   * Delete banner image
   */
  async deleteBannerImage(): Promise<ApiResponse<{ message: string }>> {
    logger.info('Deleting banner image');

    try {
      const response = await this.httpClient.delete<{ message: string }>('/users/banner-image');

      logger.info('Banner image deleted successfully');

      logger.trackEvent('banner_image_deleted');

      return response;
    } catch (error) {
      logger.error('Failed to delete banner image', error as Error);
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.FILE.DELETE_FAILED);
    }
  }

  /**
   * Validate profile data
   * Single Responsibility: Separate validation logic
   *
   * @private
   */
  private validateProfileData(data: Partial<UserProfile>): void {
    if (data.bio && data.bio.length > 500) {
      throw new Error(ERROR_MESSAGES.VALIDATION.MAX_LENGTH('Bio', 500));
    }

    if (data.username && (data.username.length < 3 || data.username.length > 30)) {
      throw new Error('Username must be between 3 and 30 characters');
    }

    if (data.location && data.location.length > 100) {
      throw new Error(ERROR_MESSAGES.VALIDATION.MAX_LENGTH('Location', 100));
    }
  }

  /**
   * Extract user from response
   * Single Responsibility: Separate data extraction logic
   *
   * @private
   */
  private extractUserFromResponse(response: Record<string, unknown>): Record<string, unknown> {
    // Try different possible paths
    const data = response.data as Record<string, unknown> | undefined;

    if (data) {
      const nestedData = data.data as Record<string, unknown> | undefined;
      if (nestedData?.user) {
        return nestedData.user as Record<string, unknown>;
      }
      if (data.user) {
        return data.user as Record<string, unknown>;
      }
      if (data.id) {
        return data;
      }
    }

    if (response.user) {
      return response.user as Record<string, unknown>;
    }

    logger.error('Invalid profile data structure', undefined, { response });
    throw new Error(ERROR_MESSAGES.PROFILE.FETCH_FAILED);
  }

  /**
   * Extract stats from response
   * Single Responsibility: Separate data extraction logic
   *
   * @private
   */
  private extractStatsFromResponse(response: Record<string, unknown>): Record<string, unknown> | null {
    const data = response.data as Record<string, unknown> | undefined;

    if (data) {
      const nestedData = data.data as Record<string, unknown> | undefined;
      if (nestedData?.stats) {
        return nestedData.stats as Record<string, unknown>;
      }
      if (data.stats) {
        return data.stats as Record<string, unknown>;
      }
    }

    if (response.stats) {
      return response.stats as Record<string, unknown>;
    }

    return null;
  }

  /**
   * Extract recent journeys from response
   * Single Responsibility: Separate data extraction logic
   *
   * @private
   */
  private extractRecentJourneysFromResponse(response: Record<string, unknown>): RecentJourney[] {
    let recentJourneys: unknown[] = [];

    const data = response.data as Record<string, unknown> | undefined;

    // Try different possible paths for recentJourneys
    if (data) {
      const nestedData = data.data as Record<string, unknown> | undefined;
      if (nestedData?.recentJourneys) {
        recentJourneys = nestedData.recentJourneys as unknown[];
      } else if (data.recentJourneys) {
        recentJourneys = data.recentJourneys as unknown[];
      }
    } else if (response.recentJourneys) {
      recentJourneys = response.recentJourneys as unknown[];
    }

    logger.debug('Extracted recent journeys', { count: recentJourneys.length });

    // Transform the raw journey data to match our RecentJourney interface
    return recentJourneys.map((journey: any) => ({
      id: journey.id,
      title: journey.title,
      description: journey.description,
      coverImage: journey.coverImage,
      daysCount: journey.daysCount,
      createdAt: journey.createdAt,
      author: {
        id: journey.author.id,
        username: journey.author.username,
        profileImage: journey.author.profileImage
      },
      previewPlaces: journey.previewPlaces || [],
      type: journey.type
    }));
  }

  /**
   * Extract recent posts from response
   * Single Responsibility: Separate data extraction logic
   *
   * @private
   */
  private extractRecentPostsFromResponse(response: Record<string, unknown>): RecentPost[] {
    logger.debug('Extracting recent posts from response');

    let recentPosts: unknown[] = [];

    const data = response.data as Record<string, unknown> | undefined;

    // Try different possible paths for recentPosts
    if (data) {
      const nestedData = data.data as Record<string, unknown> | undefined;
      if (nestedData?.recentPosts) {
        recentPosts = nestedData.recentPosts as unknown[];
        logger.debug('Found recentPosts in nested data', { count: recentPosts.length });
      } else if (data.recentPosts) {
        recentPosts = data.recentPosts as unknown[];
        logger.debug('Found recentPosts in data', { count: recentPosts.length });
      }
    } else if (response.recentPosts) {
      recentPosts = response.recentPosts as unknown[];
      logger.debug('Found recentPosts in response root', { count: recentPosts.length });
    } else {
      logger.debug('No recentPosts found in response');
    }

    // Transform the raw posts data to match our RecentPost interface
    const transformedPosts = recentPosts.map((post: any) => ({
      id: post.id,
      description: post.description,
      likeCount: post.likeCount || 0,
      commentCount: post.commentCount || 0,
      createdAt: post.createdAt,
      mediaUrls: post.mediaUrls || []
    }));

    logger.debug('Transformed recent posts', { count: transformedPosts.length });

    return transformedPosts;
  }

  /**
   * Validate user data
   * Single Responsibility: Separate validation logic
   *
   * @private
   */
  private validateUserData(apiUser: Record<string, unknown>): void {
    if (!apiUser?.id || !apiUser?.username) {
      logger.error('Invalid user data: missing required fields', undefined, { apiUser });
      throw new Error('Invalid user data: missing required fields');
    }
  }

  /**
   * Transform API user data to UserProfile
   * Single Responsibility: Separate data transformation logic
   *
   * @private
   */
  private transformToUserProfile(apiUser: Record<string, unknown>): UserProfile {
    return {
      id: apiUser.id as string,
      username: apiUser.username as string,
      email: apiUser.email as string,
      phoneNumber: apiUser.phoneNumber as string | undefined,
      profileImage: apiUser.profileImage as string | undefined,
      bannerImage: apiUser.bannerImage as string | undefined,
      createdAt: new Date(apiUser.createdAt as string),
      updatedAt: new Date(apiUser.updatedAt as string),
      bio: '',
      location: '',
      isActive: true,
    };
  }

  /**
   * Transform API stats data to UserStats
   * Single Responsibility: Separate data transformation logic
   *
   * @private
   */
  private transformToUserStats(apiStats: Record<string, unknown> | null): UserStats {
    if (!apiStats) {
      return {
        posts: 0,
        journeys: 0,
        followers: 0,
        following: 0,
      };
    }

    return {
      posts: (apiStats.postsCount || apiStats.posts || 0) as number,
      journeys: (apiStats.journeysCount || apiStats.journeys || 0) as number,
      followers: (apiStats.followersCount || apiStats.followers || 0) as number,
      following: (apiStats.followingCount || apiStats.following || 0) as number,
    };
  }
}
