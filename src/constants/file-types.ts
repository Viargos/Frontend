/**
 * File type constants for the Viargos frontend
 *
 * Usage:
 * ```typescript
 * import { FILE_TYPES } from '@/constants/file-types';
 * if (FILE_TYPES.IMAGES.includes(file.type)) { ... }
 * ```
 */

export const FILE_TYPES = {
  // Image types
  IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'] as const,

  // Video types
  VIDEOS: ['video/mp4', 'video/mov', 'video/webm'] as const,

  // Document types (for future use)
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] as const,
} as const;

/**
 * MIME type to human-readable extension mapping
 */
export const MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/mov': 'mov',
  'video/webm': 'webm',
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

/**
 * Get file extension from MIME type
 */
export const getExtensionFromMimeType = (mimeType: string): string => {
  return MIME_TO_EXTENSION[mimeType] || 'unknown';
};

/**
 * Check if file type is an image
 */
export const isImageFile = (mimeType: string): boolean => {
  return FILE_TYPES.IMAGES.includes(mimeType as any);
};

/**
 * Check if file type is a video
 */
export const isVideoFile = (mimeType: string): boolean => {
  return FILE_TYPES.VIDEOS.includes(mimeType as any);
};
