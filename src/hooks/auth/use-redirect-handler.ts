'use client';

import { useEffect } from 'react';
import { useAuthModalStore } from '@/store/auth-modal.store';

/**
 * Validates redirect path for security.
 * Prevents open redirect vulnerabilities.
 */
function isValidRedirect(path: string | null): boolean {
  if (!path) return false;

  // Must start with / (relative path only)
  if (!path.startsWith('/')) return false;

  // Must NOT contain :// (no absolute URLs)
  if (path.includes('://')) return false;

  // Must NOT start with javascript:, data:, etc.
  if (/^(javascript|data|vbscript|file):/i.test(path)) return false;

  return true;
}

/**
 * Global redirect handler hook.
 *
 * Responsibilities:
 * - On app startup, read ?redirect= from the current URL (if present)
 * - Validate and persist redirect target in sessionStorage
 * - Auto-open the login modal
 * - Clean the URL (remove redirect query param)
 *
 * This hook should be called once at app initialization (e.g. in AuthInitializer).
 */
export function useRedirectHandler() {
  const { openLogin } = useAuthModalStore();

  useEffect(() => {
    // Guard for non-browser environments
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    const redirectParam = url.searchParams.get('redirect');

    if (redirectParam && isValidRedirect(redirectParam)) {
      try {
        sessionStorage.setItem(
          'viargos_redirect_after_login',
          redirectParam,
        );
      } catch (error) {
        console.warn('Failed to store redirect:', error);
      }

      // Auto-open login modal so user can authenticate
      openLogin();

      // Clean URL by removing redirect param
      url.searchParams.delete('redirect');
      window.history.replaceState({}, '', url.toString());
    }
  }, [openLogin]);
}

