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
import { UserApi } from '@/lib/api';

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
 * Attempt to fetch the current user profile.
 * Returns null on any error (401, network, etc.) without throwing.
 */
async function fetchUserProfile(): Promise<UserDto | null> {
  try {
    const profile = await UserApi.getProfile({ suppressSessionExpired: true });
    const user = profile.user;

    if (!user?.id || !user?.email) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

/**
 * Attempt an explicit token refresh via the frontend Route Handler.
 * Returns true if the refresh succeeded, false otherwise.
 * Does NOT throw.
 */
async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Rehydrate user session from backend
 *
 * Call this on app initialization to restore user state after page refresh.
 *
 * Flow:
 * 1. Try fetching user profile directly (happy path: access_token is valid)
 * 2. If that fails, explicitly attempt token refresh (access_token expired)
 * 3. If refresh succeeds, retry profile fetch
 * 4. Return user on success, null if not authenticated
 *
 * @returns UserDto if authenticated, null if not
 */
export async function rehydrateSession(): Promise<UserDto | null> {
  // Step 1: Happy path — access_token is valid
  const user = await fetchUserProfile();
  if (user) return user;

  // Step 2: Profile failed — try explicit token refresh
  // (handles cases where access_token is expired or missing but refresh_token exists)
  console.log('[rehydrateSession] Initial profile fetch failed, attempting token refresh...');
  const refreshed = await refreshAccessToken();

  if (!refreshed) {
    // No valid refresh_token or refresh endpoint failed → not authenticated
    console.log('[rehydrateSession] Token refresh failed — user not authenticated');
    return null;
  }

  // Step 3: Refresh succeeded — retry profile fetch with new access_token
  console.log('[rehydrateSession] Token refresh succeeded, retrying profile fetch...');
  const userAfterRefresh = await fetchUserProfile();

  if (!userAfterRefresh) {
    console.error('[rehydrateSession] Profile fetch failed after successful refresh');
    return null;
  }

  return userAfterRefresh;
}

/**
 * Check if user is authenticated (synchronously)
 * This is a lightweight check - only checks cookie existence
 * Does NOT validate token or call backend
 */
export function isAuthenticatedSync(): boolean {
  return hasAuthCookies();
}
