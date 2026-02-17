import { httpClient } from '../core/api-client';
import { API_ENDPOINTS } from '../config/endpoints';
import type {
  SigninRequestDto,
  SigninResponseDto,
  RefreshResponseDto,
  SignupRequestDto,
  SignupResponseDto,
  VerifyOtpRequestDto,
  VerifyOtpResponseDto,
  ForgotPasswordRequestDto,
  ResetPasswordRequestDto,
  ResendOtpRequestDto,
  SigninUserDto,
} from '@/lib/dtos/auth';

export class AuthApiService {
  /**
   * Sign in user with email and password
   * @param payload Signin credentials (email, password)
   * @returns Authenticated user data
   */
  async signin(payload: SigninRequestDto): Promise<SigninUserDto> {
    const response = await httpClient.post<SigninResponseDto>(
      API_ENDPOINTS.AUTH.SIGNIN,
      payload
    );
    return response.data;
  }

  /**
   * Sign out current user and clear session
   * Invalidates access and refresh tokens
   */
  async signout(): Promise<void> {
    await httpClient.post<{ message?: string }>(API_ENDPOINTS.AUTH.SIGNOUT, {});
  }

  /**
   * Refresh access token using refresh token cookie
   * @returns New token data
   */
  async refresh(): Promise<RefreshResponseDto> {
    return httpClient.post<RefreshResponseDto>(API_ENDPOINTS.AUTH.REFRESH, {});
  }

  /**
   * Create new user account
   * @param payload User registration data (email, username, password)
   * @returns Created user data
   */
  async signup(payload: SignupRequestDto): Promise<SigninUserDto> {
    const response = await httpClient.post<SignupResponseDto>(
      API_ENDPOINTS.AUTH.SIGNUP,
      payload
    );
    return response.data;
  }

  /**
   * Verify OTP code sent to email
   * @param payload OTP verification data (email, otp)
   * @returns Authenticated user data
   */
  async verifyOtp(payload: VerifyOtpRequestDto): Promise<SigninUserDto> {
    const response = await httpClient.post<VerifyOtpResponseDto>(
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      payload
    );
    return response.data;
  }

  /**
   * Request password reset email with OTP
   * @param payload Email address for password reset
   */
  async forgotPassword(payload: ForgotPasswordRequestDto): Promise<void> {
    await httpClient.post<{ message: string }>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      payload
    );
  }

  /**
   * Reset password using OTP code
   * @param payload Password reset data (email, otp, newPassword)
   */
  async resetPassword(payload: ResetPasswordRequestDto): Promise<void> {
    await httpClient.post<{ message: string }>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      payload
    );
  }

  /**
   * Resend OTP code to email
   * @param payload Email address to resend OTP
   */
  async resendOtp(payload: ResendOtpRequestDto): Promise<void> {
    await httpClient.post<{ message: string }>(
      API_ENDPOINTS.AUTH.RESEND_OTP,
      payload
    );
  }
}

export const AuthApi = new AuthApiService();
