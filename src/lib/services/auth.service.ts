import { IAuthService, IValidationService } from '../interfaces/auth.interface';
import { IHttpClient, ApiResponse } from '../interfaces/http-client.interface';
import { LoginCredentials, SignUpCredentials, User, AuthResponse } from '@/types/auth.types';

export class AuthService implements IAuthService {
  constructor(
    private httpClient: IHttpClient,
    private validationService: IValidationService
  ) {}

  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    // Validate credentials
    if (!this.validationService.validateEmail(credentials.email)) {
      throw new Error('Please enter a valid email address');
    }

    if (!credentials.password || credentials.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    return this.httpClient.post<AuthResponse>('/auth/signin', credentials);
  }

  async signup(credentials: SignUpCredentials): Promise<ApiResponse<{ message: string }>> {
    // Validate email
    if (!this.validationService.validateEmail(credentials.email)) {
      throw new Error('Please enter a valid email address');
    }

    // Validate username
    const usernameValidation = this.validationService.validateUsername(credentials.username);
    if (!usernameValidation.isValid) {
      throw new Error(usernameValidation.errors[0]);
    }

    // Validate password
    const passwordValidation = this.validationService.validatePassword(credentials.password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors[0]);
    }

    return this.httpClient.post<{ message: string }>('/auth/signup', credentials);
  }

  async verifyOtp(email: string, otp: string): Promise<ApiResponse<AuthResponse>> {
    // Validate inputs
    if (!this.validationService.validateEmail(email)) {
      throw new Error('Please enter a valid email address');
    }

    if (!this.validationService.validateOtp(otp)) {
      throw new Error('Please enter a valid 6-digit OTP');
    }

    return this.httpClient.post<AuthResponse>('/auth/verify-otp', { email, otp });
  }

  async resendOtp(email: string): Promise<ApiResponse<{ message: string }>> {
    if (!this.validationService.validateEmail(email)) {
      throw new Error('Please enter a valid email address');
    }

    return this.httpClient.post<{ message: string }>('/auth/resend-otp', { email });
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.httpClient.get<User>('/auth/profile');
  }

  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    if (!this.validationService.validateEmail(email)) {
      throw new Error('Please enter a valid email address');
    }

    return this.httpClient.post<{ message: string }>('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse<{ message: string }>> {
    if (!token) {
      throw new Error('Reset token is required');
    }

    const passwordValidation = this.validationService.validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors[0]);
    }

    return this.httpClient.post<{ message: string }>('/auth/reset-password', { token, password });
  }
}
