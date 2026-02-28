import type {
  ForgotPasswordRequestDto,
  ForgotPasswordResponseDto,
  LogoutResponseDto,
  ProfileResponseDto,
  RefreshResponseDto,
  ResendOtpRequestDto,
  ResetPasswordRequestDto,
  ResetPasswordResponseDto,
  SigninRequestDto,
  SigninResponseDto,
  SignupRequestDto,
  SignupResponseDto,
  VerifyOtpRequestDto,
  VerifyOtpResponseDto,
} from '@/modules/auth/dto/auth.dto';
import type { AuthSigninResult, AuthUser } from '@/modules/auth/types/auth.types';
import { ApiError, httpClient } from '@/lib/api/http-client';
import { mapProfileResponseToUser, mapSigninResponseToResult, mapVerifyOtpResponseToUser } from '@/modules/auth/mappers/auth.mapper';
import { unwrapEnvelope } from '@/modules/common/mappers';
import { AuthServiceError } from './auth.errors';

type BackendErrorResponse = {
  statusCode?: number;
  error?: string;
  message?: string;
  details?: Record<string, unknown>;
};

function toAuthError(error: unknown): AuthServiceError {
  if (error instanceof AuthServiceError) {
    return error;
  }

  if (error instanceof ApiError) {
    return new AuthServiceError({
      code: 'UNKNOWN',
      details: error.details,
      message: error.message,
      statusCode: error.statusCode,
    });
  }

  const backendError = error as BackendErrorResponse | null;
  return new AuthServiceError({
    code: 'UNKNOWN',
    details: backendError?.details,
    message: backendError?.message ?? 'Request failed',
    statusCode: backendError?.statusCode ?? 500,
  });
}

async function requestBff<TResponse>(path: string, options?: RequestInit): Promise<TResponse> {
  try {
    const payload = await httpClient.request<unknown>(path, {
      body: options?.body ?? null,
      headers: options?.headers,
      method: (options?.method ?? 'GET') as 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT',
      signal: options?.signal ?? undefined,
    });

    if (payload && typeof payload === 'object' && 'data' in payload) {
      return unwrapEnvelope<TResponse>(payload).data;
    }

    return payload as TResponse;
  } catch (error) {
    throw toAuthError(error);
  }
}

export const authService = {
  async forgotPassword(payload: ForgotPasswordRequestDto): Promise<void> {
    await requestBff<ForgotPasswordResponseDto>('/auth/forgot-password', {
      body: JSON.stringify(payload),
      method: 'POST',
    });
  },

  async logout(): Promise<void> {
    await requestBff<LogoutResponseDto>('/auth/logout', {
      method: 'POST',
    });
  },

  async profile(): Promise<AuthUser> {
    const response = await requestBff<ProfileResponseDto>('/auth/profile', {
      method: 'GET',
    });

    return mapProfileResponseToUser(response);
  },

  async refresh(): Promise<void> {
    await requestBff<RefreshResponseDto>('/auth/refresh', {
      method: 'POST',
    });
  },

  async resendOtp(payload: ResendOtpRequestDto): Promise<void> {
    await requestBff<ForgotPasswordResponseDto>('/auth/resend-otp', {
      body: JSON.stringify(payload),
      method: 'POST',
    });
  },

  async resendVerification(payload: ResendOtpRequestDto): Promise<void> {
    await requestBff<ForgotPasswordResponseDto>('/auth/resend-verification', {
      body: JSON.stringify(payload),
      method: 'POST',
    });
  },

  async resetPassword(payload: ResetPasswordRequestDto): Promise<void> {
    await requestBff<ResetPasswordResponseDto>('/auth/reset-password', {
      body: JSON.stringify(payload),
      method: 'POST',
    });
  },

  async signin(payload: SigninRequestDto): Promise<AuthSigninResult> {
    const response = await requestBff<SigninResponseDto>('/auth/signin', {
      body: JSON.stringify(payload),
      method: 'POST',
    });

    return mapSigninResponseToResult(response);
  },

  async signup(payload: SignupRequestDto): Promise<void> {
    await requestBff<SignupResponseDto>('/auth/signup', {
      body: JSON.stringify(payload),
      method: 'POST',
    });
  },

  async verifyOtp(payload: VerifyOtpRequestDto): Promise<AuthUser | null> {
    const response = await requestBff<VerifyOtpResponseDto>('/auth/verify-otp', {
      body: JSON.stringify(payload),
      method: 'POST',
    });

    return mapVerifyOtpResponseToUser(response);
  },

  async verifyEmail(payload: VerifyOtpRequestDto): Promise<AuthUser | null> {
    const response = await requestBff<VerifyOtpResponseDto>('/auth/verify-email', {
      body: JSON.stringify(payload),
      method: 'POST',
    });

    return mapVerifyOtpResponseToUser(response);
  },
};
