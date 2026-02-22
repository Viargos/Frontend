/**
 * Shared types for the API layer.
 */

import { HttpMethod } from '@/enums';

export interface RequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  credentials?: RequestCredentials;
  cache?: RequestCache;
  /** When true, body is sent as-is (e.g. FormData) and Content-Type is not set */
  bodyAsFormData?: boolean;
}
