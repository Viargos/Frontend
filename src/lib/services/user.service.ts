import { IUserService } from '../interfaces/auth.interface';
import { IHttpClient, ApiResponse } from '../interfaces/http-client.interface';

export class UserService implements IUserService {
  constructor(private httpClient: IHttpClient) {}

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

  async getCurrentUserStats(): Promise<ApiResponse<{
    posts: number;
    journeys: number;
    followers: number;
    following: number;
  }>> {
    try {
      const [postCount, journeyCount, followerCount, followingCount] = await Promise.all([
        this.httpClient.get<{ count: number }>('/posts/user/me/count'),
        this.httpClient.get<any[]>('/journeys/my-journeys'),
        this.httpClient.get<{ count: number }>('/users/relationships/followers/count'),
        this.httpClient.get<{ count: number }>('/users/relationships/following/count'),
      ]);

      return {
        statusCode: 200,
        message: 'Current user stats retrieved successfully',
        data: {
          posts: postCount.data?.count || 0,
          journeys: journeyCount.data?.length || 0,
          followers: followerCount.data?.count || 0,
          following: followingCount.data?.count || 0,
        },
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Failed to retrieve current user stats',
        data: { posts: 0, journeys: 0, followers: 0, following: 0 },
      };
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
