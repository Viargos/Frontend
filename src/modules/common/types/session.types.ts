export type SessionUser = {
  id: string;
  email: string;
  username?: string;
};

export type SessionState = {
  isAuthenticated: boolean;
  user?: SessionUser;
};

export type SessionRefreshResult = {
  refreshed: boolean;
  reason: 'not_implemented' | 'missing_refresh_cookie' | 'refresh_failed';
};
