import { AUTH_DEFAULT_REDIRECT_PATH, AUTH_REDIRECT_KEY } from '@/modules/auth/constants/auth.constants';

function isValidRedirectPath(path: string): boolean {
  if (!path.startsWith('/')) {
    return false;
  }

  if (path.includes('://')) {
    return false;
  }

  return !/^(?:javascript|data|vbscript|file):/i.test(path);
}

export function readAuthRedirectPath(): string {
  if (typeof window === 'undefined') {
    return AUTH_DEFAULT_REDIRECT_PATH;
  }

  const stored = window.sessionStorage.getItem(AUTH_REDIRECT_KEY);

  if (stored && isValidRedirectPath(stored)) {
    return stored;
  }

  return AUTH_DEFAULT_REDIRECT_PATH;
}

export function clearAuthRedirectPath(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(AUTH_REDIRECT_KEY);
}
