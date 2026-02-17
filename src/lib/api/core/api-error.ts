import type { ApiErrorDto } from '@/lib/dtos/common/api-error.dto';

export enum ApiErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  INVALID_OTP = 'INVALID_OTP',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN = 'UNKNOWN',
}

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: ApiErrorCode,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  is(code: ApiErrorCode): boolean {
    return this.code === code;
  }

  getUserMessage(): string {
    switch (this.code) {
      case ApiErrorCode.UNAUTHORIZED:
        return 'Invalid credentials. Please try again.';
      case ApiErrorCode.EMAIL_NOT_VERIFIED:
        return 'Please verify your email before logging in.';
      case ApiErrorCode.INVALID_OTP:
        return 'Invalid or expired code. Please try again.';
      case ApiErrorCode.NETWORK_ERROR:
        return 'Network error. Please check your connection.';
      case ApiErrorCode.VALIDATION_ERROR:
        return this.message || 'Please check your input.';
      default:
        return this.message || 'Something went wrong. Please try again.';
    }
  }

  /**
   * Build ApiError from backend error body (ApiErrorDto shape).
   */
  static fromResponse(statusCode: number, body: unknown): ApiError {
    const dto = (body || {}) as ApiErrorDto & { error?: string };
    const message = dto.message ?? dto.error ?? 'Request failed';
    const code = mapBackendErrorToCode(statusCode, dto.error ?? dto.message);
    return new ApiError(statusCode, code, String(message), body);
  }
}

function mapBackendErrorToCode(
  statusCode: number,
  backendError?: string
): ApiErrorCode {
  if (backendError) {
    const upper = String(backendError).toUpperCase().replace(/\s+/g, '_');
    if (upper.includes('EMAIL_NOT_VERIFIED') || upper.includes('VERIFY'))
      return ApiErrorCode.EMAIL_NOT_VERIFIED;
    if (upper.includes('INVALID_OTP') || upper.includes('OTP'))
      return ApiErrorCode.INVALID_OTP;
    if (upper.includes('UNAUTHORIZED')) return ApiErrorCode.UNAUTHORIZED;
    if (upper.includes('FORBIDDEN')) return ApiErrorCode.FORBIDDEN;
    if (upper.includes('NOT_FOUND')) return ApiErrorCode.NOT_FOUND;
    if (upper.includes('CONFLICT')) return ApiErrorCode.CONFLICT;
    if (upper.includes('VALIDATION')) return ApiErrorCode.VALIDATION_ERROR;
  }
  switch (statusCode) {
    case 401:
      return ApiErrorCode.UNAUTHORIZED;
    case 403:
      return ApiErrorCode.FORBIDDEN;
    case 400:
      return ApiErrorCode.VALIDATION_ERROR;
    case 404:
      return ApiErrorCode.NOT_FOUND;
    case 409:
      return ApiErrorCode.CONFLICT;
    case 500:
    case 502:
    case 503:
      return ApiErrorCode.SERVER_ERROR;
    default:
      return ApiErrorCode.UNKNOWN;
  }
}
