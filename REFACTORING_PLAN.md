# Frontend Refactoring & Production Readiness Plan

**Project**: Viargos Frontend (Next.js 15 + React 19)
**Version**: 1.0.0
**Last Updated**: 2025-11-27

---

## 📋 Table of Contents

1. [Security & Token Management](#phase-1-security--token-management)
2. [Code Organization & Architecture](#phase-2-code-organization--architecture)
3. [State Management & Data Flow](#phase-3-state-management--data-flow)
4. [Performance Optimization](#phase-4-performance-optimization)
5. [Error Handling & User Experience](#phase-5-error-handling--user-experience)
6. [Testing & Quality](#phase-6-testing--quality)

---

## 🎯 Overall Goals

- ✅ Implement secure token storage and management
- ✅ Organize code with proper structure (enums, constants, utils)
- ✅ Optimize state management with Zustand
- ✅ Improve performance (code splitting, lazy loading, caching)
- ✅ Add comprehensive error handling
- ✅ Implement proper form validation
- ✅ Achieve production-ready frontend

---

## PHASE 1: Security & Token Management (Week 1)

### Step 1.1: Secure Token Storage
**Time**: 4 hours

**Current Issue**:
- Tokens stored in localStorage (vulnerable to XSS)
- No token refresh mechanism
- No automatic token expiration handling

**Tasks**:
- [ ] Create secure token management service
- [ ] Implement httpOnly cookie strategy (backend coordination needed)
- [ ] Add token refresh logic
- [ ] Implement automatic logout on token expiry
- [ ] Add token validation before requests

**Files to create**:
```
src/lib/
├── auth/
│   ├── token-manager.ts
│   ├── token-storage.ts
│   ├── auth-interceptor.ts
│   └── auth-config.ts
```

**Implementation**:
```typescript
// src/lib/auth/token-storage.ts
export enum StorageKey {
  ACCESS_TOKEN = 'viargos_access_token',
  REFRESH_TOKEN = 'viargos_refresh_token',
  USER_DATA = 'viargos_user_data',
}

export class TokenStorage {
  // Use sessionStorage for more security (cleared on tab close)
  // or localStorage for persistence
  private static storage = typeof window !== 'undefined' ? localStorage : null;

  static setAccessToken(token: string): void {
    if (!this.storage) return;
    this.storage.setItem(StorageKey.ACCESS_TOKEN, token);
  }

  static getAccessToken(): string | null {
    if (!this.storage) return null;
    return this.storage.getItem(StorageKey.ACCESS_TOKEN);
  }

  static setRefreshToken(token: string): void {
    if (!this.storage) return;
    this.storage.setItem(StorageKey.REFRESH_TOKEN, token);
  }

  static getRefreshToken(): string | null {
    if (!this.storage) return null;
    return this.storage.getItem(StorageKey.REFRESH_TOKEN);
  }

  static clearTokens(): void {
    if (!this.storage) return;
    this.storage.removeItem(StorageKey.ACCESS_TOKEN);
    this.storage.removeItem(StorageKey.REFRESH_TOKEN);
    this.storage.removeItem(StorageKey.USER_DATA);
  }

  static setUserData(user: any): void {
    if (!this.storage) return;
    this.storage.setItem(StorageKey.USER_DATA, JSON.stringify(user));
  }

  static getUserData(): any | null {
    if (!this.storage) return null;
    const data = this.storage.getItem(StorageKey.USER_DATA);
    return data ? JSON.parse(data) : null;
  }
}

// src/lib/auth/token-manager.ts
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  sub: string;
  email: string;
  exp: number;
  iat: number;
}

export class TokenManager {
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  }

  static isTokenExpiringSoon(token: string, thresholdMinutes: number = 5): boolean {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      const thresholdSeconds = thresholdMinutes * 60;
      return decoded.exp - currentTime < thresholdSeconds;
    } catch {
      return true;
    }
  }

  static getTokenExpiryTime(token: string): Date | null {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return new Date(decoded.exp * 1000);
    } catch {
      return null;
    }
  }

  static getUserIdFromToken(token: string): string | null {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.sub;
    } catch {
      return null;
    }
  }
}

// src/lib/auth/auth-interceptor.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { TokenStorage } from './token-storage';
import { TokenManager } from './token-manager';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

export function setupAuthInterceptor(axiosInstance: typeof axios) {
  // Request interceptor - add token to headers
  axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = TokenStorage.getAccessToken();

      if (token && !TokenManager.isTokenExpired(token)) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle token refresh
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // If error is 401 and we haven't retried yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // Wait for token refresh to complete
          return new Promise((resolve) => {
            subscribeTokenRefresh((token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = TokenStorage.getRefreshToken();
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          // Call refresh token endpoint
          const response = await axios.post('/api/v1/auth/refresh', {
            refreshToken,
          });

          const { accessToken } = response.data;
          TokenStorage.setAccessToken(accessToken);

          // Notify all waiting requests
          onTokenRefreshed(accessToken);
          isRefreshing = false;

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Refresh failed - logout user
          TokenStorage.clearTokens();
          window.location.href = '/';
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
}
```

---

### Step 1.2: Environment Variables Security
**Time**: 2 hours

**Tasks**:
- [ ] Create `.env.example` file
- [ ] Remove any sensitive data from .env
- [ ] Validate required environment variables
- [ ] Add runtime environment validation

**Files to create**:
```
src/lib/
└── config/
    ├── env.config.ts
    └── env.validation.ts
```

**Implementation**:
```typescript
// src/lib/config/env.config.ts
export const ENV = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000',
  GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-2',
  AWS_S3_BUCKET: process.env.NEXT_PUBLIC_AWS_S3_BUCKET || '',
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
} as const;

// src/lib/config/env.validation.ts
export function validateEnvironmentVariables() {
  const required = [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

// Call in app/layout.tsx
if (typeof window === 'undefined') {
  validateEnvironmentVariables();
}
```

---

### Step 1.3: Input Validation & Sanitization
**Time**: 3 hours

**Tasks**:
- [ ] Add client-side validation schemas
- [ ] Implement input sanitization
- [ ] Add XSS protection
- [ ] Validate all user inputs

**Dependencies**:
```bash
npm install dompurify
npm install @types/dompurify -D
```

**Files to create**:
```
src/lib/
└── validation/
    ├── schemas/
    │   ├── auth.schema.ts
    │   ├── post.schema.ts
    │   ├── journey.schema.ts
    │   └── user.schema.ts
    └── sanitize.ts
```

**Implementation**:
```typescript
// src/lib/validation/sanitize.ts
import DOMPurify from 'dompurify';

export class Sanitizer {
  static sanitizeHtml(dirty: string): string {
    if (typeof window === 'undefined') return dirty;
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href', 'target'],
    });
  }

  static sanitizeText(text: string): string {
    return text
      .replace(/[<>]/g, '') // Remove < and >
      .trim();
  }

  static sanitizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return '';
      }
      return url;
    } catch {
      return '';
    }
  }
}

// src/lib/validation/schemas/auth.schema.ts
import { z } from 'zod';

export const signUpSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must not exceed 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z
    .string()
    .email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;

// src/lib/validation/schemas/post.schema.ts
export const createPostSchema = z.object({
  description: z
    .string()
    .min(1, 'Description is required')
    .max(5000, 'Description is too long'),
  location: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  journeyId: z.string().uuid().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
```

---

### Step 1.4: API Security Headers
**Time**: 1 hour

**Tasks**:
- [ ] Add security headers to API requests
- [ ] Implement CSRF protection
- [ ] Add request signing (optional)

**Implementation**:
```typescript
// Update http-client.service.ts
const httpClient = axios.create({
  baseURL: ENV.API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // CSRF protection
  },
  withCredentials: true, // For httpOnly cookies
});
```

---

## PHASE 2: Code Organization & Architecture (Week 2)

### Step 2.1: Create Enums & Constants
**Time**: 3 hours

**Tasks**:
- [ ] Extract all magic strings to enums
- [ ] Create constants for configuration
- [ ] Organize by feature domain

**Files to create**:
```
src/lib/
├── enums/
│   ├── user.enum.ts
│   ├── post.enum.ts
│   ├── journey.enum.ts
│   ├── chat.enum.ts
│   ├── auth.enum.ts
│   ├── ui.enum.ts
│   └── index.ts
└── constants/
    ├── api.constants.ts
    ├── ui.constants.ts
    ├── validation.constants.ts
    ├── file.constants.ts
    ├── routes.constants.ts
    └── index.ts
```

**Implementation**:
```typescript
// src/lib/enums/user.enum.ts
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum UserRole {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

// src/lib/enums/post.enum.ts
export enum PostMediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

export enum PostSortBy {
  RECENT = 'RECENT',
  POPULAR = 'POPULAR',
  TRENDING = 'TRENDING',
}

// src/lib/enums/journey.enum.ts
export enum JourneyPlaceType {
  STAY = 'STAY',
  ACTIVITY = 'ACTIVITY',
  FOOD = 'FOOD',
  TRANSPORT = 'TRANSPORT',
  NOTE = 'NOTE',
}

export enum JourneyStatus {
  PLANNING = 'PLANNING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum JourneyVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  FRIENDS_ONLY = 'FRIENDS_ONLY',
}

// src/lib/enums/ui.enum.ts
export enum ModalType {
  SIGN_IN = 'SIGN_IN',
  SIGN_UP = 'SIGN_UP',
  OTP_VERIFICATION = 'OTP_VERIFICATION',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
  CREATE_POST = 'CREATE_POST',
  CREATE_JOURNEY = 'CREATE_JOURNEY',
}

export enum ToastType {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

// src/lib/constants/api.constants.ts
export const API_ENDPOINTS = {
  AUTH: {
    SIGN_UP: '/auth/signup',
    SIGN_IN: '/auth/signin',
    SIGN_OUT: '/auth/signout',
    VERIFY_OTP: '/auth/verify-otp',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    REFRESH_TOKEN: '/auth/refresh',
  },
  USER: {
    PROFILE: '/users/profile/me',
    BY_ID: (id: string) => `/users/${id}`,
    SEARCH: '/users/search',
    FOLLOW: (id: string) => `/users/${id}/follow`,
    UNFOLLOW: (id: string) => `/users/${id}/follow`,
    UPLOAD_PROFILE_IMAGE: '/users/profile-image',
    UPLOAD_BANNER_IMAGE: '/users/banner-image',
  },
  POST: {
    LIST: '/posts',
    CREATE: '/posts',
    BY_ID: (id: string) => `/posts/${id}`,
    UPDATE: (id: string) => `/posts/${id}`,
    DELETE: (id: string) => `/posts/${id}`,
    LIKE: (id: string) => `/posts/${id}/like`,
    UNLIKE: (id: string) => `/posts/${id}/like`,
    COMMENTS: (id: string) => `/posts/${id}/comments`,
    DASHBOARD: '/posts/dashboard',
    UPLOAD_MEDIA: '/posts/media',
  },
  JOURNEY: {
    LIST: '/journeys',
    CREATE: '/journeys',
    BY_ID: (id: string) => `/journeys/${id}`,
    UPDATE: (id: string) => `/journeys/${id}`,
    DELETE: (id: string) => `/journeys/${id}`,
    ADD_DAY: (id: string) => `/journeys/${id}/days`,
    ADD_PLACE: (dayId: string) => `/journeys/${dayId}/places`,
  },
  CHAT: {
    MESSAGES: (userId: string) => `/chat/messages/${userId}`,
    SEND: '/chat/messages',
    MARK_READ: '/chat/mark-read',
    SEARCH_USERS: '/chat/search-users',
  },
} as const;

// src/lib/constants/validation.constants.ts
export const VALIDATION = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9_]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 100,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
  },
  POST: {
    DESCRIPTION_MAX_LENGTH: 5000,
  },
  COMMENT: {
    MAX_LENGTH: 1000,
  },
  BIO: {
    MAX_LENGTH: 500,
  },
} as const;

// src/lib/constants/file.constants.ts
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm'],
  PROFILE_IMAGE: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_WIDTH: 1000,
    MAX_HEIGHT: 1000,
  },
  BANNER_IMAGE: {
    MAX_SIZE: 5 * 1024 * 1024,
    MAX_WIDTH: 1920,
    MAX_HEIGHT: 500,
  },
  POST_IMAGE: {
    MAX_SIZE: 10 * 1024 * 1024,
  },
} as const;

// src/lib/constants/ui.constants.ts
export const UI = {
  ANIMATION: {
    DURATION: {
      FAST: 150,
      NORMAL: 300,
      SLOW: 500,
    },
    EASING: {
      EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      EASE_OUT: 'cubic-bezier(0.0, 0, 0.2, 1)',
      EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
    },
  },
  DEBOUNCE: {
    SEARCH: 300,
    SCROLL: 150,
    RESIZE: 200,
  },
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
} as const;

// src/lib/constants/routes.constants.ts
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  EXPLORE: '/explore',
  PROFILE: (username: string) => `/profile/${username}`,
  JOURNEYS: '/journeys',
  JOURNEY_DETAIL: (id: string) => `/journeys/${id}`,
  CHAT: '/chat',
  SETTINGS: '/settings',
  NOTIFICATIONS: '/notifications',
} as const;
```

---

### Step 2.2: Create Utility Functions
**Time**: 4 hours

**Tasks**:
- [ ] Date/time utilities
- [ ] String manipulation utilities
- [ ] Array utilities
- [ ] File utilities
- [ ] Format utilities

**Files to create**:
```
src/lib/
└── utils/
    ├── date.util.ts
    ├── string.util.ts
    ├── array.util.ts
    ├── file.util.ts
    ├── format.util.ts
    ├── url.util.ts
    ├── storage.util.ts
    └── index.ts
```

**Implementation**:
```typescript
// src/lib/utils/date.util.ts
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';

export class DateUtil {
  static formatDate(date: Date | string, formatStr: string = 'PPP'): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  }

  static formatRelativeTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (isToday(dateObj)) {
      return `Today at ${format(dateObj, 'HH:mm')}`;
    }

    if (isYesterday(dateObj)) {
      return `Yesterday at ${format(dateObj, 'HH:mm')}`;
    }

    return formatDistanceToNow(dateObj, { addSuffix: true });
  }

  static formatTimeAgo(date: Date | string): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  }

  static isExpired(expiryDate: Date | string): boolean {
    const dateObj = typeof expiryDate === 'string' ? parseISO(expiryDate) : expiryDate;
    return new Date() > dateObj;
  }
}

// src/lib/utils/string.util.ts
export class StringUtil {
  static truncate(text: string, length: number, suffix: string = '...'): string {
    if (text.length <= length) return text;
    return text.substring(0, length).trim() + suffix;
  }

  static capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  static slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  static extractHashtags(text: string): string[] {
    const hashtagRegex = /#[\w]+/g;
    return text.match(hashtagRegex) || [];
  }

  static extractMentions(text: string): string[] {
    const mentionRegex = /@[\w]+/g;
    return text.match(mentionRegex) || [];
  }

  static formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }
}

// src/lib/utils/file.util.ts
export class FileUtil {
  static async validateImageFile(file: File): Promise<void> {
    // Check file size
    if (file.size > FILE_UPLOAD.MAX_SIZE) {
      throw new Error(`File size must be less than ${FILE_UPLOAD.MAX_SIZE / 1024 / 1024}MB`);
    }

    // Check file type
    if (!FILE_UPLOAD.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed');
    }

    // Validate image dimensions
    const dimensions = await this.getImageDimensions(file);
    if (dimensions.width > 4000 || dimensions.height > 4000) {
      throw new Error('Image dimensions are too large');
    }
  }

  static async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }

  static async compressImage(file: File, maxWidth: number = 1920): Promise<File> {
    // Implementation using canvas or library like browser-image-compression
    // For now, return original file
    return file;
  }

  static getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// src/lib/utils/array.util.ts
export class ArrayUtil {
  static removeDuplicates<T>(array: T[], key?: keyof T): T[] {
    if (!key) {
      return Array.from(new Set(array));
    }

    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }

  static groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((result, item) => {
      const groupKey = String(item[key]);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    }, {} as Record<string, T[]>);
  }

  static sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];

      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  static chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// src/lib/utils/format.util.ts
export class FormatUtil {
  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  }

  static formatPhoneNumber(phone: string): string {
    // Simple US phone formatting
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return phone;
  }

  static formatCoordinates(lat: number, lng: number): string {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}

// src/lib/utils/url.util.ts
export class UrlUtil {
  static buildQueryString(params: Record<string, any>): string {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => query.append(key, String(v)));
        } else {
          query.append(key, String(value));
        }
      }
    });

    const queryString = query.toString();
    return queryString ? `?${queryString}` : '';
  }

  static parseQueryString(search: string): Record<string, string> {
    const params = new URLSearchParams(search);
    const result: Record<string, string> = {};

    params.forEach((value, key) => {
      result[key] = value;
    });

    return result;
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

// src/lib/utils/storage.util.ts
export class StorageUtil {
  static setItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;

    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  static getItem<T>(key: string, defaultValue?: T): T | null {
    if (typeof window === 'undefined') return defaultValue || null;

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return defaultValue || null;
    }
  }

  static removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }

  static clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  }
}
```

---

### Step 2.3: Refactor Services
**Time**: 6 hours

**Tasks**:
- [ ] Consolidate API calls in services
- [ ] Add request/response types
- [ ] Implement error handling
- [ ] Add retry logic
- [ ] Create service factory pattern

**Files to refactor**:
```
src/lib/services/
├── base.service.ts         # Base service class
├── auth.service.ts
├── user.service.ts
├── post.service.ts
├── journey.service.ts
├── chat.service.ts
├── upload.service.ts       # New - centralized file uploads
└── index.ts
```

**Implementation**:
```typescript
// src/lib/services/base.service.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { ENV } from '../config/env.config';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  errors?: Record<string, string>;
  timestamp: string;
}

export class BaseService {
  protected client: AxiosInstance;

  constructor(baseURL: string = ENV.API_URL) {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Add request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = TokenStorage.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        return this.handleError(error);
      }
    );
  }

  protected async handleError(error: AxiosError<ApiError>): Promise<never> {
    if (error.response) {
      // Server responded with error
      const apiError = error.response.data;
      throw new ApiException(
        apiError.message || 'An error occurred',
        error.response.status,
        apiError.errors
      );
    } else if (error.request) {
      // Request made but no response
      throw new ApiException('Network error. Please check your connection.', 0);
    } else {
      // Something else happened
      throw new ApiException(error.message || 'An unexpected error occurred', 0);
    }
  }

  protected async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, { params });
    return response.data.data;
  }

  protected async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data);
    return response.data.data;
  }

  protected async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data);
    return response.data.data;
  }

  protected async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data);
    return response.data.data;
  }

  protected async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url);
    return response.data.data;
  }

  protected async upload<T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await this.client.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data.data;
  }
}

// src/lib/exceptions/api.exception.ts
export class ApiException extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errors?: Record<string, string>
  ) {
    super(message);
    this.name = 'ApiException';
  }

  isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  isForbidden(): boolean {
    return this.statusCode === 403;
  }

  isNotFound(): boolean {
    return this.statusCode === 404;
  }

  isValidationError(): boolean {
    return this.statusCode === 400 && !!this.errors;
  }
}

// Update auth.service.ts
import { BaseService } from './base.service';
import { API_ENDPOINTS } from '../constants';
import { SignUpInput, SignInInput } from '../validation/schemas/auth.schema';

export class AuthService extends BaseService {
  async signUp(data: SignUpInput): Promise<{ message: string }> {
    return this.post(API_ENDPOINTS.AUTH.SIGN_UP, data);
  }

  async signIn(data: SignInInput): Promise<{ accessToken: string; user: User }> {
    const response = await this.post<{ accessToken: string }>(
      API_ENDPOINTS.AUTH.SIGN_IN,
      data
    );

    // Store token
    TokenStorage.setAccessToken(response.accessToken);

    // Fetch user data
    const user = await this.getCurrentUser();
    TokenStorage.setUserData(user);

    return { ...response, user };
  }

  async verifyOtp(email: string, otp: string): Promise<{ accessToken: string }> {
    const response = await this.post<{ accessToken: string }>(
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      { email, otp }
    );

    TokenStorage.setAccessToken(response.accessToken);
    return response;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  }

  async resetPassword(newPassword: string): Promise<{ message: string }> {
    return this.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { newPassword });
  }

  async signOut(): Promise<void> {
    TokenStorage.clearTokens();
    // Clear any other cached data
  }

  private async getCurrentUser(): Promise<User> {
    return this.get(API_ENDPOINTS.USER.PROFILE);
  }
}

// Similar refactoring for other services...
```

---

### Step 2.4: Type Definitions Organization
**Time**: 2 hours

**Tasks**:
- [ ] Consolidate type definitions
- [ ] Create shared types
- [ ] Add API response types
- [ ] Document complex types

**Files to organize**:
```
src/types/
├── api/
│   ├── auth.types.ts
│   ├── user.types.ts
│   ├── post.types.ts
│   ├── journey.types.ts
│   └── chat.types.ts
├── common/
│   ├── pagination.types.ts
│   ├── response.types.ts
│   └── error.types.ts
└── index.ts
```

---

## PHASE 3: State Management & Data Flow (Week 3)

### Step 3.1: Zustand Store Optimization
**Time**: 5 hours

**Tasks**:
- [ ] Split large stores into slices
- [ ] Add proper TypeScript types
- [ ] Implement selectors
- [ ] Add middleware (devtools, persist)
- [ ] Optimize re-renders

**Implementation**:
```typescript
// src/store/slices/auth.slice.ts
import { StateCreator } from 'zustand';

export interface AuthSlice {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  user: TokenStorage.getUserData(),
  isAuthenticated: !!TokenStorage.getAccessToken(),
  isLoading: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (loading) => set({ isLoading: loading }),
  logout: () => {
    TokenStorage.clearTokens();
    set({ user: null, isAuthenticated: false });
  },
});

// src/store/index.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createAuthSlice, AuthSlice } from './slices/auth.slice';
import { createPostSlice, PostSlice } from './slices/post.slice';

type StoreState = AuthSlice & PostSlice;

export const useStore = create<StoreState>()(
  devtools(
    persist(
      (...a) => ({
        ...createAuthSlice(...a),
        ...createPostSlice(...a),
      }),
      {
        name: 'viargos-storage',
        partialize: (state) => ({
          // Only persist specific fields
          user: state.user,
        }),
      }
    )
  )
);

// Selectors
export const useAuth = () => useStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
}));

export const useAuthActions = () => useStore((state) => ({
  setUser: state.setUser,
  setLoading: state.setLoading,
  logout: state.logout,
}));
```

---

### Step 3.2: Data Fetching Strategy
**Time**: 4 hours

**Tasks**:
- [ ] Implement SWR or React Query
- [ ] Add cache invalidation
- [ ] Optimize refetch strategies
- [ ] Add optimistic updates

**Dependencies**:
```bash
npm install @tanstack/react-query
```

---

## PHASE 4: Performance Optimization (Week 4)

### Step 4.1: Code Splitting & Lazy Loading
**Time**: 3 hours

**Tasks**:
- [ ] Implement route-based code splitting
- [ ] Lazy load heavy components
- [ ] Add loading states
- [ ] Optimize bundle size

**Implementation**:
```typescript
// app/(dashboard)/layout.tsx
import { lazy, Suspense } from 'react';

const DashboardSidebar = lazy(() => import('@/components/layout/DashboardSidebar'));
const DashboardHeader = lazy(() => import('@/components/layout/DashboardHeader'));

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-layout">
      <Suspense fallback={<SkeletonHeader />}>
        <DashboardHeader />
      </Suspense>
      <Suspense fallback={<SkeletonSidebar />}>
        <DashboardSidebar />
      </Suspense>
      <main>{children}</main>
    </div>
  );
}
```

---

### Step 4.2: Image Optimization
**Time**: 2 hours

**Tasks**:
- [ ] Use Next.js Image component
- [ ] Implement lazy loading for images
- [ ] Add blur placeholders
- [ ] Optimize image sizes

---

### Step 4.3: Performance Monitoring
**Time**: 2 hours

**Tasks**:
- [ ] Add Web Vitals tracking
- [ ] Implement performance monitoring
- [ ] Add error boundaries
- [ ] Setup analytics

---

## PHASE 5: Error Handling & User Experience (Week 5)

### Step 5.1: Global Error Handling
**Time**: 4 hours

**Tasks**:
- [ ] Create error boundary components
- [ ] Add global error handler
- [ ] Implement toast notifications
- [ ] Add retry mechanisms

**Files to create**:
```
src/components/
├── error/
│   ├── ErrorBoundary.tsx
│   ├── ErrorFallback.tsx
│   └── GlobalError.tsx
└── ui/
    └── Toast.tsx
```

---

### Step 5.2: Loading States
**Time**: 3 hours

**Tasks**:
- [ ] Create skeleton loaders
- [ ] Add loading spinners
- [ ] Implement progressive loading
- [ ] Add suspense boundaries

---

### Step 5.3: Offline Support
**Time**: 3 hours

**Tasks**:
- [ ] Add service worker
- [ ] Implement offline detection
- [ ] Cache API responses
- [ ] Show offline UI

---

## PHASE 6: Testing & Quality (Week 6)

### Step 6.1: Unit Testing
**Time**: 8 hours

**Tasks**:
- [ ] Setup Vitest
- [ ] Write unit tests for utilities
- [ ] Write tests for hooks
- [ ] Write tests for components

**Dependencies**:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

---

### Step 6.2: Integration Testing
**Time**: 6 hours

**Tasks**:
- [ ] Setup Playwright
- [ ] Write E2E tests for critical flows
- [ ] Test authentication flow
- [ ] Test post creation flow

---

### Step 6.3: Code Quality
**Time**: 2 hours

**Tasks**:
- [ ] Configure ESLint
- [ ] Setup Prettier
- [ ] Add pre-commit hooks
- [ ] Add TypeScript strict mode

---

## 📊 Progress Tracking

### Week 1: Security & Token Management ⬜
- [ ] Secure Token Storage (Step 1.1)
- [ ] Environment Variables (Step 1.2)
- [ ] Input Validation (Step 1.3)
- [ ] API Security (Step 1.4)

### Week 2: Code Organization ⬜
- [ ] Enums & Constants (Step 2.1)
- [ ] Utility Functions (Step 2.2)
- [ ] Service Refactoring (Step 2.3)
- [ ] Type Definitions (Step 2.4)

### Week 3: State Management ⬜
- [ ] Zustand Optimization (Step 3.1)
- [ ] Data Fetching (Step 3.2)

### Week 4: Performance ⬜
- [ ] Code Splitting (Step 4.1)
- [ ] Image Optimization (Step 4.2)
- [ ] Performance Monitoring (Step 4.3)

### Week 5: UX & Error Handling ⬜
- [ ] Error Handling (Step 5.1)
- [ ] Loading States (Step 5.2)
- [ ] Offline Support (Step 5.3)

### Week 6: Testing ⬜
- [ ] Unit Testing (Step 6.1)
- [ ] Integration Testing (Step 6.2)
- [ ] Code Quality (Step 6.3)

---

## 🎯 Success Metrics

- [ ] Lighthouse Score: 90+
- [ ] First Contentful Paint: <1.5s
- [ ] Time to Interactive: <3s
- [ ] Test Coverage: 70%+
- [ ] Zero console errors in production
- [ ] TypeScript strict mode enabled
- [ ] All forms validated
- [ ] Proper error handling everywhere

---

**Start Date**: _____________
**Target Completion**: 6 weeks
**Team**: _____________
**Review Frequency**: Weekly
