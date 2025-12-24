/**
 * Centralized error messages for the Viargos frontend
 *
 * Usage:
 * ```typescript
 * import { ERROR_MESSAGES } from '@/constants/error-messages';
 * throw new Error(ERROR_MESSAGES.AUTH.INVALID_EMAIL);
 * ```
 */

export const ERROR_MESSAGES = {
  // Generic errors
  GENERIC: {
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    SERVER_ERROR: 'Server error. Please try again later.',
    NOT_FOUND: 'The requested resource was not found.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    FORBIDDEN: 'Access forbidden.',
  },

  // Authentication errors
  AUTH: {
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_CREDENTIALS: 'Invalid email or password',
    PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
    PASSWORD_NO_LOWERCASE: 'Password must contain at least one lowercase letter',
    PASSWORD_NO_UPPERCASE: 'Password must contain at least one uppercase letter',
    PASSWORD_NO_NUMBER: 'Password must contain at least one number',
    PASSWORD_NO_SPECIAL: 'Password must contain at least one special character',
    USERNAME_TOO_SHORT: 'Username must be at least 3 characters',
    USERNAME_TOO_LONG: 'Username must not exceed 30 characters',
    USERNAME_INVALID_CHARS: 'Username can only contain letters, numbers, underscores, and hyphens',
    USERNAME_INVALID_FORMAT: 'Username cannot start or end with underscore or hyphen',
    OTP_INVALID: 'Please enter a valid 6-digit OTP',
    OTP_EXPIRED: 'OTP has expired. Please request a new one',
    TOKEN_REQUIRED: 'Reset token is required',
    TOKEN_INVALID: 'Invalid or expired token',
    TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
    LOGIN_FAILED: 'Login failed. Please try again.',
    SIGNUP_FAILED: 'Registration failed. Please try again.',
    LOGOUT_FAILED: 'Logout failed. Please try again.',
    NO_ACCESS_TOKEN: 'No access token received',
    PROFILE_FETCH_FAILED: 'Failed to get user profile',
    AUTH_INIT_FAILED: 'Failed to initialize authentication state',
  },

  // Post errors
  POST: {
    CREATE_FAILED: 'Failed to create post',
    UPDATE_FAILED: 'Failed to update post',
    DELETE_FAILED: 'Failed to delete post',
    FETCH_FAILED: 'Failed to fetch post',
    FETCH_USER_POSTS_FAILED: 'Failed to fetch user posts',
    FETCH_PUBLIC_POSTS_FAILED: 'Failed to fetch public posts',
    FETCH_COUNT_FAILED: 'Failed to fetch post count',
    LIKE_FAILED: 'Failed to like post',
    UNLIKE_FAILED: 'Failed to unlike post',
    ADD_MEDIA_FAILED: 'Failed to add media to post',
    UPLOAD_MEDIA_FAILED: 'Failed to upload post media',
  },

  // Comment errors
  COMMENT: {
    ADD_FAILED: 'Failed to add comment',
    DELETE_FAILED: 'Failed to delete comment',
    FETCH_FAILED: 'Failed to fetch comments',
    FETCH_REPLIES_FAILED: 'Failed to fetch replies',
  },

  // User errors
  USER: {
    FETCH_FAILED: 'Failed to fetch user data',
    UPDATE_FAILED: 'Failed to update user',
    SEARCH_FAILED: 'Failed to search users',
    FOLLOW_FAILED: 'Failed to follow user',
    UNFOLLOW_FAILED: 'Failed to unfollow user',
  },

  // Profile errors
  PROFILE: {
    FETCH_FAILED: 'Failed to fetch profile',
    UPDATE_FAILED: 'Failed to update profile',
    IMAGE_UPLOAD_FAILED: 'Failed to upload profile image',
    BANNER_UPLOAD_FAILED: 'Failed to upload banner image',
  },

  // Journey errors
  JOURNEY: {
    CREATE_FAILED: 'Failed to create journey',
    UPDATE_FAILED: 'Failed to update journey',
    DELETE_FAILED: 'Failed to delete journey',
    FETCH_FAILED: 'Failed to fetch journey',
    FETCH_LIST_FAILED: 'Failed to fetch journeys',
    SEARCH_FAILED: 'Failed to search journeys',
  },

  // Chat errors
  CHAT: {
    SEND_MESSAGE_FAILED: 'Failed to send message',
    FETCH_MESSAGES_FAILED: 'Failed to fetch messages',
    FETCH_CONVERSATIONS_FAILED: 'Failed to fetch conversations',
    DELETE_MESSAGE_FAILED: 'Failed to delete message',
    UPDATE_MESSAGE_FAILED: 'Failed to update message',
    MARK_READ_FAILED: 'Failed to mark messages as read',
    CONNECTION_FAILED: 'Failed to connect to chat server',
    WEBSOCKET_ERROR: 'WebSocket connection error',
    FETCH_FAILED: 'Failed to fetch chat data',
    FETCH_USER_FAILED: 'Failed to fetch user',
    SEARCH_USERS_FAILED: 'Failed to search users',
    CREATE_CONVERSATION_FAILED: 'Failed to create conversation',
    FETCH_CONVERSATION_FAILED: 'Failed to fetch conversation',
    DELETE_CONVERSATION_FAILED: 'Failed to delete conversation',
    FETCH_ONLINE_USERS_FAILED: 'Failed to fetch online users',
    UPDATE_STATUS_FAILED: 'Failed to update user status',
  },

  // File errors
  FILE: {
    NO_FILE_PROVIDED: 'No file was provided',
    INVALID_TYPE: 'Invalid file type. Only JPEG, PNG, WebP and GIF images are allowed.',
    INVALID_IMAGE_TYPE: 'Invalid image type. Only JPEG, PNG, WebP and GIF images are allowed.',
    INVALID_VIDEO_TYPE: 'Invalid video type. Only MP4, MOV and WebM videos are allowed.',
    TOO_LARGE: (maxSizeMB: number) => `File size too large. Maximum size is ${maxSizeMB}MB.`,
    IMAGE_TOO_LARGE: (maxSizeMB: number) => `Image size too large. Maximum size is ${maxSizeMB}MB.`,
    VIDEO_TOO_LARGE: (maxSizeMB: number) => `Video size too large. Maximum size is ${maxSizeMB}MB.`,
    UPLOAD_FAILED: 'File upload failed',
    DELETE_FAILED: 'File delete failed',
  },

  // Validation errors
  VALIDATION: {
    REQUIRED_FIELD: (fieldName: string) => `${fieldName} is required`,
    INVALID_FORMAT: (fieldName: string) => `${fieldName} has invalid format`,
    MIN_LENGTH: (fieldName: string, min: number) => `${fieldName} must be at least ${min} characters`,
    MAX_LENGTH: (fieldName: string, max: number) => `${fieldName} must not exceed ${max} characters`,
    PHONE_INVALID: 'Phone number must be between 10 and 15 digits',
  },

  // Dashboard errors
  DASHBOARD: {
    FETCH_POSTS_FAILED: 'Failed to fetch dashboard posts',
    LOAD_MORE_FAILED: 'Failed to load more posts',
  },
} as const;
