import { httpClient } from '../core/api-client';
import { API_ENDPOINTS } from '../config/endpoints';
import { HttpMethod } from '@/enums';
import type { UserProfileResponseDto } from '@/lib/dtos/user/user-profile-response.dto';
import type { ProfileUpdateRequestDto } from '@/lib/dtos/user';
import type { User } from '@/types/auth.types';
import type { ApiResponse } from '@/lib/dtos/common';

export class UserApiService {
  /**
   * Get current user's profile
   * @returns User profile with stats and relationship data
   */
  async getProfile(): Promise<UserProfileResponseDto> {
    const response = await httpClient.get<ApiResponse<UserProfileResponseDto>>(
      API_ENDPOINTS.USER.ME
    );
    return response.data;
  }

  /**
   * Get user details by ID
   * @param userId User ID
   * @returns User profile with stats and relationship status
   */
  async getDetails(userId: string): Promise<UserProfileResponseDto> {
    const response = await httpClient.get<ApiResponse<UserProfileResponseDto>>(
      API_ENDPOINTS.USER.GET(userId)
    );
    return response.data;
  }

  /**
   * Follow a user
   * @param userId User ID to follow
   */
  async follow(userId: string): Promise<void> {
    await httpClient.post<{ message: string }>(API_ENDPOINTS.USER.FOLLOW, {
      userId,
    });
  }

  /**
   * Unfollow a user
   * @param userId User ID to unfollow
   */
  async unfollow(userId: string): Promise<void> {
    await httpClient.delete<{ message: string }>(
      API_ENDPOINTS.USER.UNFOLLOW(userId)
    );
  }

  /**
   * Get user's followers
   * @param userId User ID
   * @returns Array of follower users
   */
  async getFollowers(userId: string): Promise<User[]> {
    const response = await httpClient.get<ApiResponse<User[]>>(
      API_ENDPOINTS.USER.FOLLOWERS(userId)
    );
    return response.data;
  }

  /**
   * Get users that user is following
   * @param userId User ID
   * @returns Array of following users
   */
  async getFollowing(userId: string): Promise<User[]> {
    const response = await httpClient.get<ApiResponse<User[]>>(
      API_ENDPOINTS.USER.FOLLOWING(userId)
    );
    return response.data;
  }

  /**
   * Get current user's profile (alias for getProfile)
   * @returns User profile with stats and relationship data
   */
  async getCurrentUserProfile(): Promise<UserProfileResponseDto> {
    return this.getProfile();
  }

  /**
   * Get current user's statistics
   * @returns User stats (posts, journeys, followers, following counts)
   */
  async getCurrentUserStats(): Promise<{
    posts: number;
    journeys: number;
    followers: number;
    following: number;
  }> {
    const response = await httpClient.get<
      ApiResponse<{
        posts: number;
        journeys: number;
        followers: number;
        following: number;
      }>
    >(API_ENDPOINTS.USER.STATS);
    return response.data;
  }

  /**
   * Update user profile
   * @param data Profile update data (username, bio, location)
   * @returns Updated user entity
   */
  async updateProfile(data: Partial<ProfileUpdateRequestDto>): Promise<User> {
    const response = await httpClient.request<ApiResponse<User>>(
      API_ENDPOINTS.USER.PROFILE,
      {
        method: HttpMethod.PATCH,
        body: data,
      }
    );
    return response.data;
  }

  /**
   * Upload profile image
   * @param file Image file to upload
   * @returns S3 image URL and success message
   */
  async uploadProfileImage(
    file: File
  ): Promise<{ imageUrl: string; message?: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await httpClient.request<
      ApiResponse<{ imageUrl: string; message?: string }>
    >(API_ENDPOINTS.USER.PROFILE_IMAGE, {
      method: HttpMethod.POST,
      body: formData,
      bodyAsFormData: true,
    });
    return response.data;
  }

  /**
   * Upload banner image
   * @param file Image file to upload
   * @returns S3 image URL and success message
   */
  async uploadBannerImage(
    file: File
  ): Promise<{ imageUrl: string; message?: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await httpClient.request<
      ApiResponse<{ imageUrl: string; message?: string }>
    >(API_ENDPOINTS.USER.BANNER_IMAGE, {
      method: HttpMethod.POST,
      body: formData,
      bodyAsFormData: true,
    });
    return response.data;
  }

  /**
   * Delete profile image
   */
  async deleteProfileImage(): Promise<void> {
    await httpClient.delete<{ message: string }>(
      API_ENDPOINTS.USER.PROFILE_IMAGE
    );
  }

  /**
   * Delete banner image
   */
  async deleteBannerImage(): Promise<void> {
    await httpClient.delete<{ message: string }>(
      API_ENDPOINTS.USER.BANNER_IMAGE
    );
  }
}

export const UserApi = new UserApiService();
