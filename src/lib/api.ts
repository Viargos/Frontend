/**
 * Modern API Client using Service Architecture
 * 
 * This file provides the main API interface following SOLID principles.
 * For legacy compatibility, the old apiClient is available via named import
 */

// Import legacy client
import LegacyApiClient from './api.legacy';

// Import new services
import { serviceFactory } from './services/service-factory';

// Export the new services for modern usage
export const { 
  httpClient, 
  authService, 
  userService,
  tokenService,
  validationService 
} = serviceFactory;

// Named export for backward compatibility
export { default as apiClient } from './api.legacy';

// Default export for maximum compatibility
const api = LegacyApiClient;
export default api;

// Re-export types for consistency
export type { ApiResponse, ApiError } from './interfaces/http-client.interface';
export type { IAuthService, IUserService, IValidationService } from './interfaces/auth.interface';
export type { IHttpClient, RequestConfig } from './interfaces/http-client.interface';
export type { ITokenService } from './services/token.service';

// Export the service factory for advanced usage
export { serviceFactory };

/**
 * Usage Examples:
 * 
 * // Modern service-based approach (recommended for new code):
 * import { authService } from '@/lib/api';
 * const result = await authService.login({ email, password });
 * 
 * // Legacy usage (still works, will be migrated gradually):
 * import apiClient from '@/lib/api';
 * const response = await apiClient.signIn({ email, password });
 * 
 * // Also works:
 * import { apiClient } from '@/lib/api';
 * const response = await apiClient.signIn({ email, password });
 */
