/**
 * RefreshHandler
 *
 * Coordinates access token refresh across concurrent requests.
 * Ensures that only ONE refresh call is in flight at a time.
 */

import { HttpMethod } from '@/enums';

export class RefreshHandler {
  private refreshPromise: Promise<boolean> | null = null;
  private readonly refreshUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(refreshUrl: string, fetchImpl: typeof fetch = fetch) {
    this.refreshUrl = refreshUrl;
    this.fetchImpl = fetchImpl;
  }

  /**
   * Public entry point for triggering a refresh.
   * If a refresh is already in progress, waits for it.
   */
  async refresh(): Promise<boolean> {
    // If a refresh is already in progress, reuse the same promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // Start new refresh operation
    this.refreshPromise = this.doRefresh();

    try {
      return await this.refreshPromise;
    } finally {
      // Always clear the promise when done, success or failure
      this.refreshPromise = null;
    }
  }

  /**
   * Actual refresh implementation.
   * Calls the refresh endpoint and returns true/false.
   */
  private async doRefresh(): Promise<boolean> {
    try {
      const response = await this.fetchImpl(this.refreshUrl, {
        method: HttpMethod.POST,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      // Network error or other failure
      console.error('RefreshHandler.doRefresh error:', error);
      return false;
    }
  }
}

