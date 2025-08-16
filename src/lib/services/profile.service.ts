import { IProfileService } from '@/lib/interfaces/profile.interface';
import { IHttpClient, ApiResponse } from '@/lib/interfaces/http-client.interface';
import { User } from '@/types/auth.types';
import { UserStats, UserProfile } from '@/types/profile.types';

export class ProfileService implements IProfileService {
  constructor(private httpClient: IHttpClient) {}

  async getCurrentUserProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await this.httpClient.get<any>('/users/profile/me');
      
      const apiUser = this.extractUserFromResponse(response);
      this.validateUserData(apiUser);
      
      const transformedProfile: UserProfile = {
        id: apiUser.id,
        username: apiUser.username,
        email: apiUser.email,
        phoneNumber: apiUser.phoneNumber,
        profileImage: apiUser.profileImage,
        bannerImage: apiUser.bannerImage,
        createdAt: new Date(apiUser.createdAt),
        updatedAt: new Date(apiUser.updatedAt),
        bio: '',
        location: '',
        isActive: true,
      };

      return {
        statusCode: response.statusCode || 200,
        message: response.message || 'Profile retrieved successfully',
        data: transformedProfile,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch user profile');
    }
  }

  async updateProfile(profileData: Partial<UserProfile>): Promise<ApiResponse<User>> {
    this.validateProfileData(profileData);
    return this.httpClient.put<User>('/users/profile', profileData);
  }

  async uploadProfileImage(file: File): Promise<ApiResponse<{ imageUrl: string; message: string }>> {
    this.validateImageFile(file);
    return (this.httpClient as any).uploadFile<{ imageUrl: string; message: string }>(
      '/users/profile-image',
      file,
      'image'
    );
  }

  async uploadBannerImage(file: File): Promise<ApiResponse<{ imageUrl: string; message: string }>> {
    this.validateImageFile(file);
    return (this.httpClient as any).uploadFile<{ imageUrl: string; message: string }>(
      '/users/banner-image',
      file,
      'image'
    );
  }

  async getCurrentUserStats(): Promise<ApiResponse<UserStats>> {
    try {
      const response = await this.httpClient.get<any>('/users/profile/me');
      
      const apiStats = this.extractStatsFromResponse(response);
      const transformedStats: UserStats = {
        posts: apiStats?.postsCount || apiStats?.posts || 0,
        journeys: apiStats?.journeysCount || apiStats?.journeys || 0,
        followers: apiStats?.followersCount || apiStats?.followers || 0,
        following: apiStats?.followingCount || apiStats?.following || 0,
      };

      return {
        statusCode: response.statusCode || 200,
        message: response.message || 'Stats retrieved successfully',
        data: transformedStats,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to retrieve user statistics');
    }
  }

  async deleteProfileImage(): Promise<ApiResponse<{ message: string }>> {
    return this.httpClient.delete<{ message: string }>('/users/profile-image');
  }

  async deleteBannerImage(): Promise<ApiResponse<{ message: string }>> {
    return this.httpClient.delete<{ message: string }>('/users/banner-image');
  }

  private validateProfileData(data: Partial<UserProfile>): void {
    if (data.bio && data.bio.length > 500) {
      throw new Error('Bio must be less than 500 characters');
    }

    if (data.username && (data.username.length < 3 || data.username.length > 30)) {
      throw new Error('Username must be between 3 and 30 characters');
    }

    if (data.location && data.location.length > 100) {
      throw new Error('Location must be less than 100 characters');
    }
  }

  private extractUserFromResponse(response: any): any {
    if (response.data?.data?.user) {
      return response.data.data.user;
    }
    if (response.data?.user) {
      return response.data.user;
    }
    if (response.user) {
      return response.user;
    }
    if (response.data?.id) {
      return response.data;
    }
    throw new Error('Invalid profile data structure');
  }

  private extractStatsFromResponse(response: any): any {
    if (response.data?.data?.stats) {
      return response.data.data.stats;
    }
    if (response.data?.stats) {
      return response.data.stats;
    }
    if (response.stats) {
      return response.stats;
    }
    return null;
  }

  private validateUserData(apiUser: any): void {
    if (!apiUser?.id || !apiUser?.username) {
      throw new Error('Invalid user data: missing required fields');
    }
  }

  private validateImageFile(file: File): void {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!file) {
      throw new Error('Please select a file to upload');
    }

    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only JPEG, PNG, WebP, and GIF images are allowed');
    }
  }
}
