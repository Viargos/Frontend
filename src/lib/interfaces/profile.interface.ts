import { User } from '@/types/auth.types';
import { UserStats, UserProfile, ProfileUpdateData } from '@/types/profile.types';
import { ApiResponse } from './http-client.interface';

export interface IProfileService {
  getCurrentUserProfile(): Promise<ApiResponse<UserProfile>>;
  updateProfile(profileData: Partial<UserProfile>): Promise<ApiResponse<User>>;
  uploadProfileImage(file: File): Promise<ApiResponse<{ imageUrl: string; message: string }>>;
  uploadBannerImage(file: File): Promise<ApiResponse<{ imageUrl: string; message: string }>>;
  getCurrentUserStats(): Promise<ApiResponse<UserStats>>;
  deleteProfileImage(): Promise<ApiResponse<{ message: string }>>;
  deleteBannerImage(): Promise<ApiResponse<{ message: string }>>;
}
