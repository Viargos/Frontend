/**
 * File validation utility for Viargos frontend
 *
 * Features:
 * - File type validation (MIME type checking)
 * - File size validation
 * - Image-specific validation
 * - Video-specific validation
 * - File name sanitization
 *
 * Usage:
 * ```typescript
 * import { FileValidator } from '@/utils/file-validator';
 *
 * FileValidator.validateImage(file); // Validates image file
 * FileValidator.validateProfileImage(file); // Validates profile image (5MB max)
 * FileValidator.validateVideo(file); // Validates video file
 * ```
 */

import { ERROR_MESSAGES } from '@/constants/error-messages';
import { VALIDATION_RULES, bytesToMB } from '@/constants/validation-rules';
import { FILE_TYPES, isImageFile, isVideoFile } from '@/constants/file-types';

export class FileValidator {
  /**
   * Validate image file
   */
  static validateImage(file: File, maxSizeMB: number = VALIDATION_RULES.FILE.IMAGE_MAX_SIZE_MB): void {
    if (!file) {
      throw new Error(ERROR_MESSAGES.FILE.NO_FILE_PROVIDED);
    }

    // Validate MIME type
    if (!isImageFile(file.type)) {
      throw new Error(ERROR_MESSAGES.FILE.INVALID_IMAGE_TYPE);
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new Error(ERROR_MESSAGES.FILE.IMAGE_TOO_LARGE(maxSizeMB));
    }
  }

  /**
   * Validate profile image (5MB max)
   */
  static validateProfileImage(file: File): void {
    this.validateImage(file, VALIDATION_RULES.FILE.PROFILE_IMAGE_MAX_SIZE_MB);
  }

  /**
   * Validate banner image (5MB max)
   */
  static validateBannerImage(file: File): void {
    this.validateImage(file, VALIDATION_RULES.FILE.BANNER_IMAGE_MAX_SIZE_MB);
  }

  /**
   * Validate post media (image or video)
   */
  static validatePostMedia(file: File): void {
    if (!file) {
      throw new Error(ERROR_MESSAGES.FILE.NO_FILE_PROVIDED);
    }

    if (isImageFile(file.type)) {
      this.validateImage(file, VALIDATION_RULES.FILE.IMAGE_MAX_SIZE_MB);
    } else if (isVideoFile(file.type)) {
      this.validateVideo(file, VALIDATION_RULES.FILE.VIDEO_MAX_SIZE_MB);
    } else {
      throw new Error(ERROR_MESSAGES.FILE.INVALID_TYPE);
    }
  }

  /**
   * Validate video file
   */
  static validateVideo(file: File, maxSizeMB: number = VALIDATION_RULES.FILE.VIDEO_MAX_SIZE_MB): void {
    if (!file) {
      throw new Error(ERROR_MESSAGES.FILE.NO_FILE_PROVIDED);
    }

    // Validate MIME type
    if (!isVideoFile(file.type)) {
      throw new Error(ERROR_MESSAGES.FILE.INVALID_VIDEO_TYPE);
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new Error(ERROR_MESSAGES.FILE.VIDEO_TOO_LARGE(maxSizeMB));
    }
  }

  /**
   * Get file extension from filename
   */
  static getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }

  /**
   * Sanitize filename (remove special characters, limit length)
   */
  static sanitizeFilename(filename: string): string {
    // Remove path traversal attempts
    let sanitized = filename.replace(/\.\./g, '');

    // Replace special characters with underscores
    sanitized = sanitized.replace(/[^a-zA-Z0-9.-_]/g, '_');

    // Convert to lowercase
    sanitized = sanitized.toLowerCase();

    // Limit length to 255 characters
    if (sanitized.length > 255) {
      const ext = this.getFileExtension(sanitized);
      const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));
      sanitized = nameWithoutExt.substring(0, 250) + '.' + ext;
    }

    return sanitized;
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Check if file is an image
   */
  static isImage(file: File): boolean {
    return isImageFile(file.type);
  }

  /**
   * Check if file is a video
   */
  static isVideo(file: File): boolean {
    return isVideoFile(file.type);
  }

  /**
   * Get file info (for debugging/logging)
   */
  static getFileInfo(file: File): {
    name: string;
    type: string;
    size: string;
    sizeBytes: number;
    extension: string;
    isImage: boolean;
    isVideo: boolean;
  } {
    return {
      name: file.name,
      type: file.type,
      size: this.formatFileSize(file.size),
      sizeBytes: file.size,
      extension: this.getFileExtension(file.name),
      isImage: this.isImage(file),
      isVideo: this.isVideo(file),
    };
  }

  /**
   * Validate file with custom options
   */
  static validateFile(
    file: File,
    options: {
      allowedTypes?: string[];
      maxSizeMB?: number;
      minSizeMB?: number;
    }
  ): void {
    if (!file) {
      throw new Error(ERROR_MESSAGES.FILE.NO_FILE_PROVIDED);
    }

    // Validate type if specified
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      throw new Error(ERROR_MESSAGES.FILE.INVALID_TYPE);
    }

    // Validate max size if specified
    if (options.maxSizeMB) {
      const maxSizeBytes = options.maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        throw new Error(ERROR_MESSAGES.FILE.TOO_LARGE(options.maxSizeMB));
      }
    }

    // Validate min size if specified
    if (options.minSizeMB) {
      const minSizeBytes = options.minSizeMB * 1024 * 1024;
      if (file.size < minSizeBytes) {
        throw new Error(`File size must be at least ${options.minSizeMB}MB.`);
      }
    }
  }
}
