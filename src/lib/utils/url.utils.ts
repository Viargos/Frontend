/**
 * Builds URL query string from parameters object
 * Generic function that accepts any object type with primitive values
 * @param params - Object with query parameters (string, number, boolean, undefined, null)
 * @returns Query string with leading '?' or empty string
 * @example
 * buildQueryParams({ limit: 10, offset: 0 }) // "?limit=10&offset=0"
 * buildQueryParams({ limit: undefined }) // ""
 */
export function buildQueryParams<T extends Record<string, any>>(
  params: T | undefined
): string {
  if (!params || typeof params !== 'object') return '';
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Appends query parameters to a base URL
 * Generic function that accepts any object type with primitive values
 * @param baseUrl - Base URL without query string
 * @param params - Object with query parameters (optional)
 * @returns Full URL with query string
 * @example
 * buildUrl('/api/posts', { limit: 10 }) // "/api/posts?limit=10"
 * buildUrl('/api/journeys', { sortBy: 'createdAt', limit: 20 }) // "/api/journeys?sortBy=createdAt&limit=20"
 */
export function buildUrl<T extends Record<string, any>>(
  baseUrl: string,
  params?: T
): string {
  if (!params) return baseUrl;
  return `${baseUrl}${buildQueryParams(params)}`;
}
