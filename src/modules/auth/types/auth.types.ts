import type { AuthStep } from '@/modules/auth/enums/auth-step.enum';

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  profileImage?: string | null;
  isActive: boolean;
};

export type AuthSession = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
};

export type AuthSigninResult = {
  user: AuthUser;
  verified: boolean;
  requiresVerification: boolean;
};

export type AuthApiErrorCode
  = | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'EMAIL_NOT_VERIFIED'
    | 'INVALID_OTP'
    | 'VALIDATION_ERROR'
    | 'NOT_FOUND'
    | 'CONFLICT'
    | 'SERVER_ERROR'
    | 'NETWORK_ERROR'
    | 'UNKNOWN';

export type AuthApiError = {
  code: AuthApiErrorCode;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
};

export type AuthModalState = {
  step: AuthStep;
  isOpen: boolean;
  signupEmail: string;
  passwordResetEmail: string;
  isPasswordResetFlow: boolean;
  error: string | null;
};
