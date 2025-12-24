import { LoginCredentials, SignUpCredentials, User, AuthResponse } from '@/types/auth.types';
import { ApiResponse } from './http-client.interface';
import { UserDetailsResponse } from '@/types/user.types';

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>>;
  signup(credentials: SignUpCredentials): Promise<ApiResponse<{ message: string }>>;
  verifyOtp(email: string, otp: string): Promise<ApiResponse<AuthResponse>>;
  resendOtp(email: string): Promise<ApiResponse<{ message: string }>>;
  getProfile(): Promise<ApiResponse<User>>;
  forgotPassword(email: string): Promise<ApiResponse<{ message: string }>>;
  resetPassword(password: string): Promise<ApiResponse<{ message: string }>>;
}

export interface IUserService {
  uploadProfileImage(file: File): Promise<ApiResponse<{ imageUrl: string; message: string }>>;
  uploadBannerImage(file: File): Promise<ApiResponse<{ imageUrl: string; message: string }>>;
  getCurrentUserStats(): Promise<ApiResponse<{
    posts: number;
    journeys: number;
    followers: number;
    following: number;
  }>>;
  getUserDetails(userId: string): Promise<UserDetailsResponse>;
}

export interface IValidationService {
  validateEmail(email: string): boolean;
  validatePassword(password: string): { isValid: boolean; errors: string[] };
  validateUsername(username: string): { isValid: boolean; errors: string[] };
  validateOtp(otp: string): boolean;
}
