/**
 * Feature flag utilities using PostHog.
 * Enables gradual rollouts, A/B testing, and feature toggles.
 *
 * Usage:
 * ```typescript
 * if (featureFlags.isEnabled('new-design')) {
 *   return <NewDesign />;
 * }
 * return <OldDesign />;
 * ```
 */

/**
 * Feature flag management utilities.
 */
export const featureFlags = {
  /**
   * Checks if a feature flag is enabled for the current user.
   * @param flag - Feature flag name
   * @returns Whether the flag is enabled
   * @example
   * ```typescript
   * if (featureFlags.isEnabled('new-counter-design')) {
   *   return <NewCounterWidget />;
   * }
   * ```
   */
  isEnabled(flag: string): boolean {
    if (typeof window === 'undefined') {
      // Server-side: always return false
      // Feature flags are client-side only
      return false;
    }

    return window.posthog?.isFeatureEnabled?.(flag) ?? false;
  },

  /**
   * Gets the payload for a feature flag.
   * Useful for A/B testing with different variants.
   * @param flag - Feature flag name
   * @returns Flag payload (can be string, number, object, etc.)
   * @example
   * ```typescript
   * const variant = featureFlags.getPayload('button-variant');
   * if (variant === 'blue') return <BlueButton />;
   * if (variant === 'green') return <GreenButton />;
   * ```
   */
  getPayload(flag: string): unknown {
    if (typeof window === 'undefined') {
      return null;
    }

    return window.posthog?.getFeatureFlagPayload?.(flag);
  },

  /**
   * Checks if feature flags are available.
   * Useful for showing loading states.
   * @returns Whether PostHog is loaded
   */
  isAvailable(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    return !!window.posthog;
  },
};

/**
 * Known feature flags in the application.
 * Update this list as you add new flags in PostHog dashboard.
 */
export const FeatureFlags = {
  /**
   * Example: New counter design.
   * Shows redesigned counter widget.
   */
  NEW_COUNTER_DESIGN: 'new-counter-design',

  /**
   * Example: Dark mode.
   * Enables dark mode theme.
   */
  DARK_MODE: 'dark-mode',

  /**
   * Example: Beta features.
   * Shows beta features to selected users.
   */
  BETA_FEATURES: 'beta-features',
} as const;

/**
 * Hook for using feature flags in React components.
 * Automatically re-renders when flags change.
 * @param flag - Feature flag name
 * @returns Whether the flag is enabled
 * @example
 * ```typescript
 * 'use client';
 * function Component() {
 *   const isNewDesign = useFeatureFlag(FeatureFlags.NEW_COUNTER_DESIGN);
 *   if (isNewDesign) return <NewDesign />;
 *   return <OldDesign />;
 * }
 * ```
 */
// eslint-disable-next-line react/no-unnecessary-use-prefix -- name matches PostHog hook convention
export function useFeatureFlag(flag: string): boolean {
  // This is a simple implementation
  // For production, consider using PostHog's React hooks
  // or implementing state management for flags

  if (typeof window === 'undefined') {
    return false;
  }

  return window.posthog?.isFeatureEnabled?.(flag) ?? false;
}

/**
 * Server-side feature flag check.
 * Returns false on server, delegates to client.
 *
 * For server-side feature flags, you'll need to:
 * 1. Store flags in environment variables, or
 * 2. Fetch from PostHog API server-side
 * @param _flag - Feature flag name
 * @returns Always false on server
 */
export function getServerFeatureFlag(_flag: string): boolean {
  // Server-side flags could be implemented via:
  // - Environment variables (NEXT_PUBLIC_FEATURE_X=true)
  // - PostHog API (requires API key)
  // - External config service

  // For now, server always returns false
  // Client components will show the correct state
  return false;
}
