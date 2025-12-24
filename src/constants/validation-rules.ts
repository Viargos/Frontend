/**
 * Centralized validation rules for the Viargos frontend
 *
 * Usage:
 * ```typescript
 * import { VALIDATION_RULES } from '@/constants/validation-rules';
 * if (username.length < VALIDATION_RULES.USERNAME.MIN_LENGTH) { ... }
 * ```
 */

export const VALIDATION_RULES = {
  // Username validation
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[a-zA-Z0-9_-]+$/,
    NO_START_END_SPECIAL: /^[_-]|[_-]$/,
  },

  // Email validation
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },

  // Password validation
  PASSWORD: {
    MIN_LENGTH: 6,
    REQUIRE_LOWERCASE: true,
    REQUIRE_UPPERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true,
    LOWERCASE_PATTERN: /(?=.*[a-z])/,
    UPPERCASE_PATTERN: /(?=.*[A-Z])/,
    NUMBER_PATTERN: /(?=.*\d)/,
    SPECIAL_PATTERN: /(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/,
  },

  // OTP validation
  OTP: {
    LENGTH: 6,
    PATTERN: /^\d{6}$/,
  },

  // Phone validation
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
  },

  // Post validation
  POST: {
    DESCRIPTION_MAX_LENGTH: 2000,
    CAPTION_MAX_LENGTH: 500,
  },

  // Comment validation
  COMMENT: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 500,
  },

  // Journey validation
  JOURNEY: {
    TITLE_MIN_LENGTH: 3,
    TITLE_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 1000,
  },

  // File validation
  FILE: {
    // Image validation
    IMAGE_MAX_SIZE_MB: 10,
    IMAGE_MAX_SIZE_BYTES: 10 * 1024 * 1024,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],

    // Profile image validation
    PROFILE_IMAGE_MAX_SIZE_MB: 5,
    PROFILE_IMAGE_MAX_SIZE_BYTES: 5 * 1024 * 1024,

    // Banner image validation
    BANNER_IMAGE_MAX_SIZE_MB: 5,
    BANNER_IMAGE_MAX_SIZE_BYTES: 5 * 1024 * 1024,

    // Video validation
    VIDEO_MAX_SIZE_MB: 50,
    VIDEO_MAX_SIZE_BYTES: 50 * 1024 * 1024,
    ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/mov', 'video/webm'],
  },
} as const;

/**
 * Helper function to convert MB to bytes
 */
export const mbToBytes = (mb: number): number => mb * 1024 * 1024;

/**
 * Helper function to convert bytes to MB
 */
export const bytesToMB = (bytes: number): number => bytes / (1024 * 1024);
