/**
 * Session Rehydration Utilities
 *
 * Responsibilities:
 * - Fetch user data via UserApi.getProfile()
 * - Return UserDto from canonical response shape (profile.user)
 * - Gracefully handle errors (return null, don't throw)
 *
 * MUST NOT:
 * - Update Zustand directly (caller does this)
 * - Navigate/redirect (caller does this)
 * - Show notifications (caller does this)
 */

import { UserDto } from '@/lib/dtos/user/user.dto';
import { UserApi, ApiError, ApiErrorCode } from '@/lib/api';

/**
 * Check if authentication cookies exist
 *
 * NOTE: This function CANNOT detect HttpOnly cookies (which our auth cookies are).
 * HttpOnly cookies are not accessible via JavaScript for security reasons.
 *
 * This function is kept for compatibility but always returns true on client-side,
 * allowing the actual cookie validation to happen on the server via /api/user/me.
 *
 * @deprecated Use server-side validation via /api/user/me instead
 */
export function hasAuthCookies(): boolean {
  if (typeof document === 'undefined') {
    return false; // Server-side, can't check cookies
  }

  // Since cookies are HttpOnly, we can't check them here
  // Always return true to attempt rehydration - the server will validate
  return true;
}

/**
 * Rehydrate user session from backend
 *
 * Call this on app initialization to restore user state after page refresh.
 *
 * @returns UserDto if authenticated, null if not (or on error)
 */
export async function rehydrateSession(): Promise<UserDto | null> {
  try {
    const profile = await UserApi.getProfile();
    const user = profile.user;

    if (!user?.id || !user?.email) {
      console.error('Invalid user data from UserApi.getProfile()');
      return null;
    }

    return user;
  } catch (error) {
    if (error instanceof ApiError && error.is(ApiErrorCode.UNAUTHORIZED)) {
      return null;
    }
    console.error('Session rehydration error:', error);
    return null;
  }
}

/**
 * Check if user is authenticated (synchronously)
 * This is a lightweight check - only checks cookie existence
 * Does NOT validate token or call backend
 */
export function isAuthenticatedSync(): boolean {
  return hasAuthCookies();
}
