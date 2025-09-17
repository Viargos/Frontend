import { IProfileService } from '@/lib/interfaces/profile.interface';
import { IHttpClient, ApiResponse } from '@/lib/interfaces/http-client.interface';
import { User } from '@/types/auth.types';
import { UserStats, UserProfile, RecentJourney } from '@/types/profile.types';
import { RecentPost } from '@/types/user.types';

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

  async getCurrentUserProfileWithJourneys(): Promise<ApiResponse<{ profile: UserProfile; stats: UserStats; recentJourneys: RecentJourney[]; recentPosts: RecentPost[] }>> {
    try {
      const response = await this.httpClient.get<any>('/users/profile/me');
      
      // Extract user data
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
      
      // Extract stats
      const apiStats = this.extractStatsFromResponse(response);
      const transformedStats: UserStats = {
        posts: apiStats?.postsCount || apiStats?.posts || 0,
        journeys: apiStats?.journeysCount || apiStats?.journeys || 0,
        followers: apiStats?.followersCount || apiStats?.followers || 0,
        following: apiStats?.followingCount || apiStats?.following || 0,
      };
      
      // Extract recent journeys
      const recentJourneys = this.extractRecentJourneysFromResponse(response);
      
      // Extract recent posts
      const recentPosts = this.extractRecentPostsFromResponse(response);

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
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch complete profile data');
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

  private extractRecentJourneysFromResponse(response: any): RecentJourney[] {
    let recentJourneys: any[] = [];
    
    // Try different possible paths for recentJourneys
    if (response.data?.data?.recentJourneys) {
      recentJourneys = response.data.data.recentJourneys;
    } else if (response.data?.recentJourneys) {
      recentJourneys = response.data.recentJourneys;
    } else if (response.recentJourneys) {
      recentJourneys = response.recentJourneys;
    }
    
    // Transform the raw journey data to match our RecentJourney interface
    return recentJourneys.map(journey => ({
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
    })) || [];
  }

  private extractRecentPostsFromResponse(response: any): RecentPost[] {
    console.log('ProfileService extractRecentPostsFromResponse - Full response:', response);
    
    let recentPosts: any[] = [];
    
    // Try different possible paths for recentPosts
    if (response.data?.data?.recentPosts) {
      recentPosts = response.data.data.recentPosts;
      console.log('Found recentPosts in response.data.data.recentPosts:', recentPosts);
    } else if (response.data?.recentPosts) {
      recentPosts = response.data.recentPosts;
      console.log('Found recentPosts in response.data.recentPosts:', recentPosts);
    } else if (response.recentPosts) {
      recentPosts = response.recentPosts;
      console.log('Found recentPosts in response.recentPosts:', recentPosts);
    } else {
      console.log('No recentPosts found in response');
    }
    
    console.log('Raw recentPosts array:', recentPosts);
    
    // Transform the raw posts data to match our RecentPost interface
    const transformedPosts = recentPosts.map(post => ({
      id: post.id,
      description: post.description,
      likeCount: post.likeCount || 0,
      commentCount: post.commentCount || 0,
      createdAt: post.createdAt,
      mediaUrls: post.mediaUrls || []
    })) || [];
    
    console.log('Transformed recentPosts:', transformedPosts);
    return transformedPosts;
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
