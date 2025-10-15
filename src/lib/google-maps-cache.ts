/**
 * Google Maps API Response Caching Utility
 * Reduces unnecessary API calls by caching responses
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class GoogleMapsCache {
  private cache = new Map<string, CacheItem<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Generate cache key from request parameters
   */
  private generateKey(type: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, any>);

    return `${type}:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Check if cache item is expired
   */
  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.expiresIn;
  }

  /**
   * Get cached data if available and not expired
   */
  get<T>(type: string, params: Record<string, any>): T | null {
    const key = this.generateKey(type, params);
    const item = this.cache.get(key);

    if (!item || this.isExpired(item)) {
      if (item) {
        this.cache.delete(key);
      }
      return null;
    }

    return item.data;
  }

  /**
   * Set cache data with optional TTL
   */
  set<T>(
    type: string,
    params: Record<string, any>,
    data: T,
    ttl: number = this.DEFAULT_TTL
  ): void {
    const key = this.generateKey(type, params);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn: ttl,
    });
  }

  /**
   * Clear expired items from cache
   */
  cleanup(): void {
    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const googleMapsCache = new GoogleMapsCache();

// Cleanup expired items every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    googleMapsCache.cleanup();
  }, 10 * 60 * 1000);
}
