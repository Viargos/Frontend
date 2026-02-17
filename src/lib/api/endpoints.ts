/**
 * Type-safe API endpoint definitions
 * Centralized API URLs and methods
 */

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    SIGNIN: '/api/auth/signin',
    SIGNOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    PROFILE: '/api/auth/profile',
    SIGNUP: '/api/auth/signup',
    VERIFY_OTP: '/api/auth/verify-otp',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    RESEND_OTP: '/api/auth/resend-otp',
  },

  // Post endpoints
  POSTS: {
    LIST: '/api/dashboard', // Dashboard posts with pagination
    CREATE: '/api/posts',
    GET: (id: string) => `/api/posts/${id}`,
    UPDATE: (id: string) => `/api/posts/${id}`,
    DELETE: (id: string) => `/api/posts/${id}`,
    LIKE: (id: string) => `/api/posts/${id}/like`,
    UNLIKE: (id: string) => `/api/posts/${id}/unlike`,
    COMMENTS: (id: string) => `/api/posts/${id}/comments`,
  },

  // Journey endpoints
  JOURNEYS: {
    LIST: '/api/journeys',
    CREATE: '/api/journeys',
    GET: (id: string) => `/api/journeys/${id}`,
    UPDATE: (id: string) => `/api/journeys/${id}`,
    DELETE: (id: string) => `/api/journeys/${id}`,
  },

  // User endpoints
  USERS: {
    PROFILE: (id: string) => `/api/users/${id}`,
    FOLLOW: (id: string) => `/api/users/${id}/follow`,
    UNFOLLOW: (id: string) => `/api/users/${id}/unfollow`,
    FOLLOWERS: (id: string) => `/api/users/${id}/followers`,
    FOLLOWING: (id: string) => `/api/users/${id}/following`,
  },
} as const;
