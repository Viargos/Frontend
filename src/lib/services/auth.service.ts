/**
 * Authentication Service - Migrated Version
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Handles only authentication-related operations
 * - Open/Closed: Open for extension through interfaces, closed for modification
 * - Liskov Substitution: Implements IAuthService interface correctly
 * - Interface Segregation: Depends only on required interfaces (IHttpClient, IValidationService)
 * - Dependency Inversion: Depends on abstractions (interfaces), not concrete implementations
 *
 * Improvements:
 * - Centralized error messages (ERROR_MESSAGES)
 * - Structured logging with logger
 * - Better error handling with ErrorHandler
 * - Type-safe implementations
 * - Consistent validation patterns
 */

import { IAuthService, IValidationService } from '@/lib/interfaces/auth.interface';
import { IHttpClient, ApiResponse } from '@/lib/interfaces/http-client.interface';
import { LoginCredentials, SignUpCredentials, User, AuthResponse } from '@/types/auth.types';
import { ERROR_MESSAGES } from '@/constants/error-messages';
import { logger } from '@/utils/logger';
import { ErrorHandler } from '@/utils/error-handler';

export class AuthService implements IAuthService {
  constructor(
    private httpClient: IHttpClient,
    private validationService: IValidationService
  ) {
    logger.debug('AuthService initialized');
  }

  /**
   * Login user with email and password
   *
   * @throws {Error} If validation fails or API call fails
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    logger.info('Login attempt', {
      email: credentials.email,
      hasPassword: !!credentials.password,
    });

    try {
      // Validate credentials before API call
      this.validateLoginCredentials(credentials);

      // Make API call
      const response = await this.httpClient.post<AuthResponse>('/auth/signin', credentials);

      logger.info('Login successful', {
        email: credentials.email,
        hasAccessToken: !!response.data?.accessToken,
      });

      // Track successful login
      logger.trackEvent('user_login', { email: credentials.email });

      return response;
    } catch (error) {
      logger.error('Login failed', error as Error, {
        email: credentials.email,
      });

      // Re-throw with consistent error handling
      throw error;
    }
  }

  /**
   * Register new user
   *
   * @throws {Error} If validation fails or API call fails
   */
  async signup(credentials: SignUpCredentials): Promise<ApiResponse<{ message: string }>> {
    logger.info('Signup attempt', {
      email: credentials.email,
      username: credentials.username,
    });

    try {
      // Validate all fields before API call
      this.validateSignupCredentials(credentials);

      // Make API call
      const response = await this.httpClient.post<{ message: string }>('/auth/signup', credentials);

      logger.info('Signup successful', {
        email: credentials.email,
        username: credentials.username,
      });

      // Track successful signup
      logger.trackEvent('user_signup', {
        email: credentials.email,
        username: credentials.username,
      });

      return response;
    } catch (error) {
      logger.error('Signup failed', error as Error, {
        email: credentials.email,
        username: credentials.username,
      });

      // Re-throw with consistent error handling
      throw error;
    }
  }

  /**
   * Verify OTP for email verification
   *
   * @throws {Error} If validation fails or API call fails
   */
  async verifyOtp(email: string, otp: string): Promise<ApiResponse<AuthResponse>> {
    logger.info('OTP verification attempt', { email });

    try {
      // Validate inputs
      this.validateOtpInputs(email, otp);

      // Make API call
      const response = await this.httpClient.post<AuthResponse>('/auth/verify-otp', { email, otp });

      logger.info('OTP verification successful', {
        email,
        hasAccessToken: !!response.data?.accessToken,
      });

      // Track successful OTP verification
      logger.trackEvent('otp_verified', { email });

      return response;
    } catch (error) {
      logger.error('OTP verification failed', error as Error, { email });

      // Re-throw with consistent error handling
      throw error;
    }
  }

  /**
   * Resend OTP to email
   *
   * @throws {Error} If validation fails or API call fails
   */
  async resendOtp(email: string): Promise<ApiResponse<{ message: string }>> {
    logger.info('OTP resend attempt', { email });

    try {
      // Validate email
      if (!this.validationService.validateEmail(email)) {
        throw new Error(ERROR_MESSAGES.AUTH.INVALID_EMAIL);
      }

      // Make API call
      const response = await this.httpClient.post<{ message: string }>('/auth/resend-otp', { email });

      logger.info('OTP resent successfully', { email });

      // Track OTP resend
      logger.trackEvent('otp_resent', { email });

      return response;
    } catch (error) {
      logger.error('OTP resend failed', error as Error, { email });

      // Re-throw with consistent error handling
      throw error;
    }
  }

  /**
   * Get authenticated user profile
   *
   * @throws {Error} If API call fails
   */
  async getProfile(): Promise<ApiResponse<User>> {
    logger.debug('Fetching user profile');

    try {
      const response = await this.httpClient.get<User>('/auth/profile');

      logger.info('Profile fetched successfully', {
        userId: response.data?.id,
        email: response.data?.email,
      });

      return response;
    } catch (error) {
      logger.error('Profile fetch failed', error as Error);

      // Re-throw with consistent error handling
      throw error;
    }
  }

  /**
   * Request password reset
   *
   * @throws {Error} If validation fails or API call fails
   */
  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    logger.info('Forgot password attempt', { email });

    try {
      // Validate email
      if (!this.validationService.validateEmail(email)) {
        throw new Error(ERROR_MESSAGES.AUTH.INVALID_EMAIL);
      }

      // Make API call
      const response = await this.httpClient.post<{ message: string }>('/auth/forgot-password', { email });

      logger.info('Password reset requested', { email });

      // Track password reset request
      logger.trackEvent('password_reset_requested', { email });

      return response;
    } catch (error) {
      logger.error('Forgot password failed', error as Error, { email });

      // Re-throw with consistent error handling
      throw error;
    }
  }

  /**
   * Reset password with token
   * Note: Token should be set in tokenService before calling this method
   * The httpClient will automatically add it to the Authorization header
   *
   * @throws {Error} If validation fails or API call fails
   */
  async resetPassword(password: string): Promise<ApiResponse<{ message: string }>> {
    logger.info('Password reset attempt');

    try {
      // Validate password
      const passwordValidation = this.validationService.validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors[0]);
      }

      // Make API call - token is sent via Authorization header by httpClient
      const response = await this.httpClient.post<{ message: string }>('/auth/reset-password', {
        newPassword: password,
      });

      logger.info('Password reset successful');

      // Track password reset
      logger.trackEvent('password_reset_completed');

      return response;
    } catch (error) {
      logger.error('Password reset failed', error as Error);

      // Re-throw with consistent error handling
      throw error;
    }
  }

  /**
   * Validate login credentials
   * Single Responsibility: Separate validation logic
   *
   * @private
   * @throws {Error} If validation fails
   */
  private validateLoginCredentials(credentials: LoginCredentials): void {
    // Validate email
    if (!this.validationService.validateEmail(credentials.email)) {
      throw new Error(ERROR_MESSAGES.AUTH.INVALID_EMAIL);
    }

    // Validate password length
    if (!credentials.password || credentials.password.length < 6) {
      throw new Error(ERROR_MESSAGES.AUTH.PASSWORD_TOO_SHORT);
    }
  }

  /**
   * Validate signup credentials
   * Single Responsibility: Separate validation logic
   *
   * @private
   * @throws {Error} If validation fails
   */
  private validateSignupCredentials(credentials: SignUpCredentials): void {
    // Validate email
    if (!this.validationService.validateEmail(credentials.email)) {
      throw new Error(ERROR_MESSAGES.AUTH.INVALID_EMAIL);
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
  }

  /**
   * Validate OTP inputs
   * Single Responsibility: Separate validation logic
   *
   * @private
   * @throws {Error} If validation fails
   */
  private validateOtpInputs(email: string, otp: string): void {
    // Validate email
    if (!this.validationService.validateEmail(email)) {
      throw new Error(ERROR_MESSAGES.AUTH.INVALID_EMAIL);
    }

    // Validate OTP
    if (!this.validationService.validateOtp(otp)) {
      throw new Error(ERROR_MESSAGES.AUTH.OTP_INVALID);
    }
  }
}
