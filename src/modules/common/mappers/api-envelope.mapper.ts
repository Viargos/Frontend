import type { ApiError, ApiPagination, ApiSuccess } from '@/modules/common/dto';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isPagination(value: unknown): value is ApiPagination {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.page === 'number'
    && typeof value.limit === 'number'
    && typeof value.total === 'number'
    && typeof value.hasMore === 'boolean'
    && (value.nextCursor === undefined || typeof value.nextCursor === 'string')
  );
}

function isApiError(value: unknown): value is ApiError {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.error === 'string'
    && typeof value.message === 'string'
    && typeof value.statusCode === 'number'
  );
}

function isApiSuccessEnvelope<TData>(value: unknown): value is ApiSuccess<TData> {
  if (!isRecord(value) || !('data' in value)) {
    return false;
  }

  if ('pagination' in value && value.pagination !== undefined && !isPagination(value.pagination)) {
    return false;
  }

  return true;
}

export function unwrapEnvelope<TData>(response: unknown): ApiSuccess<TData> {
  if (isApiError(response)) {
    throw new Error(response.message);
  }

  if (!isApiSuccessEnvelope<TData>(response)) {
    throw new Error('Invalid API response envelope');
  }

  return response;
}
