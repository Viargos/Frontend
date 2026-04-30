import type { AuthApiErrorCode } from '@/modules/auth/types/auth.types';

export class AuthServiceError extends Error {
  public readonly statusCode: number;
  public readonly code: AuthApiErrorCode;
  public readonly details?: Record<string, unknown>;

  public constructor(options: {
    statusCode: number;
    code: AuthApiErrorCode;
    message: string;
    details?: Record<string, unknown>;
  }) {
    super(options.message);
    this.name = 'AuthServiceError';
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.details = options.details;
  }
}

function mapErrorCode(raw: string | undefined, statusCode: number): AuthApiErrorCode {
  const normalized = raw?.toUpperCase().replaceAll(' ', '_') ?? '';

  if (normalized.includes('EMAIL_NOT_VERIFIED') || normalized.includes('VERIFY')) {
    return 'EMAIL_NOT_VERIFIED';
  }

  if (normalized.includes('INVALID_OTP') || normalized.includes('OTP')) {
    return 'INVALID_OTP';
  }

  if (normalized.includes('UNAUTHORIZED')) {
    return 'UNAUTHORIZED';
  }

  if (normalized.includes('FORBIDDEN')) {
    return 'FORBIDDEN';
  }

  if (normalized.includes('VALIDATION')) {
    return 'VALIDATION_ERROR';
  }

  if (normalized.includes('NOT_FOUND')) {
    return 'NOT_FOUND';
  }

  if (normalized.includes('CONFLICT')) {
    return 'CONFLICT';
  }

  if (statusCode === 401) {
    return 'UNAUTHORIZED';
  }

  if (statusCode === 403) {
    return 'FORBIDDEN';
  }

  if (statusCode === 404) {
    return 'NOT_FOUND';
  }

  if (statusCode === 409) {
    return 'CONFLICT';
  }

  if (statusCode >= 500) {
    return 'SERVER_ERROR';
  }

  if (statusCode === 0) {
    return 'NETWORK_ERROR';
  }

  return 'UNKNOWN';
}

export function toAuthServiceError(error: unknown): AuthServiceError {
  if (error instanceof AuthServiceError) {
    return error;
  }

  if (error instanceof Error) {
    const raw = error as Error & { cause?: unknown };
    const cause = raw.cause;

    if (typeof cause === 'object' && cause !== null) {
      const maybeCause = cause as {
        statusCode?: number;
        error?: string;
        message?: string;
        details?: Record<string, unknown>;
      };

      if (typeof maybeCause.statusCode === 'number') {
        return new AuthServiceError({
          code: mapErrorCode(maybeCause.error, maybeCause.statusCode),
          details: maybeCause.details,
          message: maybeCause.message ?? raw.message,
          statusCode: maybeCause.statusCode,
        });
      }
    }

    return new AuthServiceError({
      code: 'UNKNOWN',
      message: raw.message,
      statusCode: 500,
    });
  }

  return new AuthServiceError({
    code: 'UNKNOWN',
    message: 'Unexpected error',
    statusCode: 500,
  });
}
