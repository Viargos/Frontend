/**
 * Central export for API layer
 *
 * Service Layer (NEW - use these in components):
 * - AuthApi: Authentication operations (signin, signout, signup, etc.)
 * - UserApi: User profile operations (getProfile, etc.)
 * - DashboardApi: Dashboard feed operations (getPosts)
 * - PostApi: Post operations (CRUD, like, comments, media)
 * - ApiError, ApiErrorCode: Typed error handling
 *
 * Legacy Client (for hooks that need refresh/retry):
 * - ApiClient, getApiClient, initApiClient
 */

export { ApiClient, initApiClient, getApiClient } from './client';
export { API_ENDPOINTS } from './config/endpoints';
export { initializeApiClient } from './init';

// Services (NEW - use these in components)
export { AuthApi } from './services/auth.api';
export { UserApi } from './services/user.api';
export { JourneyApi } from './services/journey.api';
export { DashboardApi } from './services/dashboard.api';
export { PostApi } from './services/post.api';
export { ChatApi } from './services/chat.api';
export { LocationApi } from './services/location.api';

// Error handling
export { ApiError, ApiErrorCode } from './core/api-error';

// Server-only: Do NOT export backend-fetch from here. It uses next/headers and
// would be pulled into client bundles. Route handlers should import directly:
//   import { backendFetch } from '@/lib/api/utils';
