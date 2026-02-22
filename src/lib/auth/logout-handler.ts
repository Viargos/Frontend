/**
 * Logout handler - orchestrates logout flow
 * Single Responsibility: Cleanup + redirect coordination
 *
 * This handler is called by:
 * - API client when refresh fails
 * - Logout button handler
 * - Any component that needs to trigger logout
 */

import { API_ENDPOINTS } from '../api/config/endpoints';
import { HttpMethod } from '@/enums';

export interface LogoutHandlerOptions {
  /**
   * Callback to clear auth state (e.g., Zustand store)
   */
  onClearState?: () => void;

  /**
   * Callback to redirect (defaults to window.location.href)
   */
  onRedirect?: (url: string) => void;

  /**
   * Whether to call backend logout endpoint
   * Default: true
   */
  callBackend?: boolean;

  /**
   * Redirect URL with optional query params
   * Default: '/?session=expired'
   */
  redirectUrl?: string;
}

/**
 * Default logout handler implementation
 */
export async function logoutHandler(options: LogoutHandlerOptions = {}): Promise<void> {
  const {
    onClearState,
    onRedirect,
    callBackend = true,
    redirectUrl = '/?session=expired',
  } = options;

  // Step 1: Clear client state (synchronous, immediate)
  if (onClearState) {
    onClearState();
  }

  // Step 2: Call frontend Route Handler (which proxies to backend)
  // IMPORTANT: Call /api/auth/signout (frontend) NOT backend directly
  if (callBackend) {
    try {
      // Call frontend Route Handler - it handles cookie clearing
      await fetch(API_ENDPOINTS.AUTH.SIGNOUT, {
        method: HttpMethod.POST,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      // Ignore errors - logout should always succeed from user perspective
      console.warn('Logout call failed (non-critical):', error);
    }
  }

  // Step 3: Redirect to home page (with session expired param to show modal)
  if (onRedirect) {
    onRedirect(redirectUrl);
  } else {
    // Default: use window.location.href (full page reload)
    window.location.href = redirectUrl;
  }
}

/**
 * Create a logout handler with Zustand store integration
 * This is a convenience factory for the most common use case
 */
export function createLogoutHandler(clearUser: () => void) {
  return (redirectUrl?: string) => {
    return logoutHandler({
      onClearState: clearUser,
      redirectUrl: redirectUrl || '/?session=expired',
    });
  };
}
