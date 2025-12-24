/**
 * Centralized success messages for the Viargos frontend
 *
 * Usage:
 * ```typescript
 * import { SUCCESS_MESSAGES } from '@/constants/success-messages';
 * toast.success(SUCCESS_MESSAGES.AUTH.LOGIN_SUCCESS);
 * ```
 */

export const SUCCESS_MESSAGES = {
  // Generic success
  GENERIC: {
    SUCCESS: 'Operation completed successfully',
    SAVED: 'Changes saved successfully',
    DELETED: 'Deleted successfully',
    UPDATED: 'Updated successfully',
    CREATED: 'Created successfully',
  },

  // Authentication success
  AUTH: {
    LOGIN_SUCCESS: 'Welcome back! Login successful.',
    SIGNUP_SUCCESS: 'Registration successful. Please verify your email.',
    LOGOUT_SUCCESS: 'You have been logged out successfully.',
    OTP_SENT: 'OTP sent to your email',
    OTP_VERIFIED: 'OTP verified successfully',
    OTP_RESENT: 'OTP has been resent to your email',
    EMAIL_VERIFIED: 'Email verified successfully',
    PASSWORD_RESET_REQUESTED: 'Password reset OTP sent to your email',
    PASSWORD_RESET_SUCCESS: 'Password reset successful. You can now log in.',
    PASSWORD_CHANGED: 'Password changed successfully',
  },

  // Post success
  POST: {
    CREATED: 'Post created successfully',
    UPDATED: 'Post updated successfully',
    DELETED: 'Post deleted successfully',
    LIKED: 'Post liked',
    UNLIKED: 'Post unliked',
    MEDIA_UPLOADED: 'Media uploaded successfully',
  },

  // Comment success
  COMMENT: {
    ADDED: 'Comment added successfully',
    DELETED: 'Comment deleted successfully',
    UPDATED: 'Comment updated successfully',
  },

  // User success
  USER: {
    FOLLOWED: 'Successfully followed user',
    UNFOLLOWED: 'Successfully unfollowed user',
    PROFILE_VIEWED: 'Profile loaded',
  },

  // Profile success
  PROFILE: {
    UPDATED: 'Profile updated successfully',
    IMAGE_UPLOADED: 'Profile image uploaded successfully',
    BANNER_UPLOADED: 'Banner image uploaded successfully',
  },

  // Journey success
  JOURNEY: {
    CREATED: 'Journey created successfully',
    UPDATED: 'Journey updated successfully',
    DELETED: 'Journey deleted successfully',
    DAY_ADDED: 'Journey day added successfully',
    PLACE_ADDED: 'Place added to journey successfully',
  },

  // Chat success
  CHAT: {
    MESSAGE_SENT: 'Message sent',
    MESSAGE_DELETED: 'Message deleted',
    MESSAGES_READ: 'Messages marked as read',
    CONNECTED: 'Connected to chat',
  },

  // File success
  FILE: {
    UPLOADED: 'File uploaded successfully',
    DELETED: 'File deleted successfully',
  },
} as const;
