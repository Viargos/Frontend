/**
 * User Service - Migrated Version
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Handles only user-related operations
 * - Open/Closed: Open for extension through interfaces, closed for modification
 * - Liskov Substitution: Implements IUserService interface correctly
 * - Interface Segregation: Depends only on required interface (IHttpClient)
 * - Dependency Inversion: Depends on abstractions (IHttpClient), not concrete implementations
 *
 * Improvements:
 * - Centralized error messages (ERROR_MESSAGES)
 * - Centralized success messages (SUCCESS_MESSAGES)
 * - Structured logging with logger
 * - Better error handling with ErrorHandler
 * - Type-safe implementations (removed 6 `any` types)
 * - Removed duplicate file validation (using FileValidator)
 * - Consistent error handling pattern
 */

import { IUserService } from '@/lib/interfaces/user.interface';
import { IHttpClient, ApiResponse } from '@/lib/interfaces/http-client.interface';
import { User, UserSearchResponse, UserSearchParams, UserDetailsResponse } from '@/types/user.types';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants';
import { logger } from '@/utils/logger';
import { ErrorHandler } from '@/utils/error-handler';
import { FileValidator } from '@/utils/file-validator';

export class UserService implements IUserService {
  constructor(private httpClient: IHttpClient) {
    logger.debug('UserService initialized');
  }

  /**
   * Upload profile image
   */
  async uploadProfileImage(file: File): Promise<ApiResponse<{ imageUrl: string; message: string }>> {
    logger.info('Uploading user profile image', {
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

      logger.info('User profile image uploaded successfully', {
        fileName: file.name,
        imageUrl: response.data?.imageUrl,
      });

      logger.trackEvent('user_profile_image_uploaded', {
        fileName: file.name,
        fileSize: file.size,
      });

      return response;
    } catch (error) {
      logger.error('Failed to upload user profile image', error as Error, {
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
    logger.info('Uploading user banner image', {
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

      logger.info('User banner image uploaded successfully', {
        fileName: file.name,
        imageUrl: response.data?.imageUrl,
      });

      logger.trackEvent('user_banner_image_uploaded', {
        fileName: file.name,
        fileSize: file.size,
      });

      return response;
    } catch (error) {
      logger.error('Failed to upload user banner image', error as Error, {
        fileName: file.name,
        fileSize: file.size,
      });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.PROFILE.BANNER_UPLOAD_FAILED);
    }
  }

  /**
   * Search users
   */
  async searchUsers(params: UserSearchParams): Promise<UserSearchResponse> {
    logger.debug('Searching users', {
      query: params.q,
      limit: params.limit || 10,
    });

    try {
      const queryParams = new URLSearchParams({
        q: params.q,
        limit: (params.limit || 10).toString()
      });

      const response = await this.httpClient.get<UserSearchResponse>(
        `/users/search/quick?${queryParams.toString()}`
      );

      const resultCount = response.data?.length || 0;

      logger.debug('User search completed', {
        query: params.q,
        resultCount,
      });

      logger.trackEvent('users_searched', {
        query: params.q,
        resultCount,
      });

      return {
        statusCode: response.statusCode || 200,
        message: response.message || 'Users retrieved successfully',
        data: response.data || []
      };
    } catch (error) {
      logger.error('User search failed', error as Error, {
        query: params.q,
        limit: params.limit,
      });

      // Return empty results instead of throwing
      return {
        statusCode: ErrorHandler.extractStatusCode(error) || 500,
        message: ErrorHandler.extractMessage(error) || ERROR_MESSAGES.USER.SEARCH_FAILED,
        data: []
      };
    }
  }

  /**
   * Get user details by ID
   */
  async getUserDetails(userId: string): Promise<UserDetailsResponse> {
    logger.debug('Fetching user details', { userId });

    try {
      const response = await this.httpClient.get<UserDetailsResponse>(
        `/users/${userId}`
      );

      logger.debug('User details fetched', {
        userId,
        hasData: !!response.data,
      });

      return {
        statusCode: response.statusCode || 200,
        message: response.message || 'User details retrieved successfully',
        data: response.data
      };
    } catch (error) {
      logger.error('Failed to fetch user details', error as Error, { userId });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.USER.FETCH_FAILED);
    }
  }

  /**
   * Get current user stats
   */
  async getCurrentUserStats(): Promise<ApiResponse<{
    posts: number;
    journeys: number;
    followers: number;
    following: number;
  }>> {
    logger.debug('Fetching current user stats');

    try {
      const [postCount, followerCount, followingCount] = await Promise.all([
        this.httpClient.get<{ count: number }>('/posts/user/me/count'),
        this.httpClient.get<{ count: number }>('/users/relationships/followers/count'),
        this.httpClient.get<{ count: number }>('/users/relationships/following/count'),
      ]);

      const stats = {
        posts: postCount.data?.count || 0,
        journeys: 0, // Removed journeys API call
        followers: followerCount.data?.count || 0,
        following: followingCount.data?.count || 0,
      };

      logger.debug('Current user stats retrieved', stats);

      return {
        statusCode: 200,
        message: 'Current user stats retrieved successfully',
        data: stats,
      };
    } catch (error) {
      logger.error('Failed to retrieve current user stats', error as Error);

      // Return default stats instead of throwing
      return {
        statusCode: 500,
        message: ERROR_MESSAGES.USER.FETCH_FAILED,
        data: { posts: 0, journeys: 0, followers: 0, following: 0 },
      };
    }
  }

  /**
   * Follow a user
   */
  async followUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    logger.info('Following user', { userId });

    try {
      const response = await this.httpClient.post<ApiResponse<{ message: string }>>(
        '/users/relationships/follow',
        { userId }
      );

      logger.info('User followed successfully', { userId });

      logger.trackEvent('user_followed', { userId });

      return {
        statusCode: response.statusCode || 200,
        message: response.message || SUCCESS_MESSAGES.USER.FOLLOWED,
        data: response.data
      };
    } catch (error) {
      logger.error('Failed to follow user', error as Error, { userId });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.USER.FOLLOW_FAILED);
    }
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    logger.info('Unfollowing user', { userId });

    try {
      const response = await this.httpClient.delete<ApiResponse<{ message: string }>>(
        `/users/relationships/unfollow/${userId}`
      );

      logger.info('User unfollowed successfully', { userId });

      logger.trackEvent('user_unfollowed', { userId });

      return {
        statusCode: response.statusCode || 200,
        message: response.message || SUCCESS_MESSAGES.USER.UNFOLLOWED,
        data: response.data
      };
    } catch (error) {
      logger.error('Failed to unfollow user', error as Error, { userId });
      throw new Error(ErrorHandler.extractMessage(error) || ERROR_MESSAGES.USER.UNFOLLOW_FAILED);
    }
  }
}
