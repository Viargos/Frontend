/**
 * Response Helper Utilities for Route Handlers
 * Provides consistent error handling and response formatting
 *
 * IMPORTANT: These helpers assume backend returns standardized response format.
 * See: /scratchpad/backend-api-standards.md for backend contract.
 *
 * Success responses: { data: T } or { data: T[], pagination?: {...} }
 * Error responses: { error: string, message?: string, statusCode?: number }
 */

import { NextResponse } from 'next/server';
import type { ApiErrorDto } from '@/lib/dtos/common/api-error.dto';

/**
 * Create standardized error response
 * Use for both backend errors and frontend-generated errors
 */
export function createErrorResponse(
  error: string | ApiErrorDto,
  status: number = 500
): NextResponse<ApiErrorDto> {
  const errorDto: ApiErrorDto =
    typeof error === 'string'
      ? { error, statusCode: status }
      : { ...error, statusCode: error.statusCode ?? status };

  return NextResponse.json(errorDto, { status });
}

/**
 * Create success response
 * Simply proxies the data with appropriate status code
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): NextResponse<T> {
  return NextResponse.json(data, { status });
}

/**
 * Handle backend fetch response with consistent error handling
 *
 * This function:
 * 1. Parses JSON from backend response
 * 2. Returns error response if backend returned error
 * 3. Returns success response with backend data
 *
 * IMPORTANT: No normalization is done. Backend MUST return consistent format.
 *
 * @param res - Backend response from backendFetch()
 * @param errorMessage - Fallback error message if backend doesn't provide one
 * @returns NextResponse with data or error
 */
export async function handleBackendResponse<T = unknown>(
  res: Response,
  errorMessage: string = 'Request failed'
): Promise<NextResponse<T | ApiErrorDto>> {
  // Parse JSON body
  const body = await res.json().catch(() => ({}));

  // If backend returned error status
  if (!res.ok) {
    // Extract error from backend response or use fallback
    const apiError: ApiErrorDto = {
      error: (body as ApiErrorDto).error ?? errorMessage,
      message: (body as ApiErrorDto).message,
      statusCode: res.status,
    };
    return createErrorResponse(apiError, res.status);
  }

  // Success: Return backend data as-is
  return createSuccessResponse<T>(body as T, res.status);
}

/**
 * Extract and validate path parameters
 * Awaits the params promise and returns typed params
 */
export async function extractParams<T extends Record<string, string>>(
  params: Promise<T>
): Promise<T> {
  return await params;
}

/**
 * Parse request body with error handling
 * Returns empty object if JSON parsing fails
 */
export async function parseRequestBody<T = unknown>(
  request: Request
): Promise<T> {
  return request.json().catch(() => ({} as T));
}
