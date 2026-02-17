/**
 * Standard API Response Wrapper
 *
 * All backend endpoints MUST return this format for success responses.
 * This enforces the contract defined in /scratchpad/backend-api-standards.md
 */

/**
 * Generic response wrapper for all API endpoints
 *
 * List endpoints: { data: T[] }
 * Single entity endpoints: { data: T }
 * Paginated endpoints: { data: T[], pagination: {...} }
 */
export interface ApiResponse<T> {
  data: T;
  pagination?: PaginationMetadata;
}

/**
 * Pagination metadata for list endpoints
 */
export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

/**
 * Type helpers for common response patterns
 */
export type ListResponse<T> = ApiResponse<T[]>;
export type SingleResponse<T> = ApiResponse<T>;
export type PaginatedResponse<T> = Required<ApiResponse<T[]>>;
