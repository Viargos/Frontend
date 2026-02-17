/**
 * Authentication-related TypeScript types
 * Shared across all auth layers
 */

export interface User {
  id: string;
  username: string;
  email: string;
  profileImage?: string | null;
  bannerImage?: string | null;
  bio?: string | null;
  location?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  shouldRetry?: boolean;
}

export interface SignInResponse {
  message: string;
  user: User;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  username: string;
  phoneNumber?: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface RefreshTokenResponse {
  message: string;
}

export interface LogoutResponse {
  message: string;
}

/**
 * Auth error codes that trigger logout
 */
export const TERMINAL_AUTH_ERRORS = [
  'REFRESH_EXPIRED',
  'REFRESH_REVOKED',
  'REFRESH_INVALID',
  'REFRESH_FAILED',
  'UNAUTHORIZED',
  'USER_INACTIVE',
] as const;

export type TerminalAuthError = typeof TERMINAL_AUTH_ERRORS[number];

/**
 * Check if an error code is terminal (requires logout)
 */
export function isTerminalAuthError(errorCode: string): errorCode is TerminalAuthError {
  return TERMINAL_AUTH_ERRORS.includes(errorCode as TerminalAuthError);
}
