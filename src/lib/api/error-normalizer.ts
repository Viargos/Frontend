import type { ApiErrorPayload } from '@/lib/api/api-error';
import { ApiError } from '@/lib/api/api-error';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  return (
    isRecord(value)
    && typeof value.error === 'string'
    && typeof value.message === 'string'
    && typeof value.statusCode === 'number'
  );
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (isApiErrorPayload(error)) {
    return new ApiError(error);
  }

  if (error instanceof Error) {
    return new ApiError({
      error: 'UNEXPECTED_ERROR',
      message: error.message,
      statusCode: 500,
    });
  }

  return new ApiError({
    error: 'UNEXPECTED_ERROR',
    message: 'An unexpected error occurred',
    statusCode: 500,
  });
}
