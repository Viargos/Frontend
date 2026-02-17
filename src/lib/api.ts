/**
 * Main API entry point - re-exports from new cookie-based API layer
 *
 * All new code should import from '@/lib/api' or '@/lib/api/index'.
 * This file provides backward compatibility for existing imports.
 *
 * Migration completed: All Bearer token services removed, cookie-based auth now used.
 */

// Re-export everything from the new API layer
export * from './api/index';
