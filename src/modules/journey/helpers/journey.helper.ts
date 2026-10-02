export function createClientId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

/**
 * Produces a deterministic client ID from a stable seed (e.g. a date string or
 * a server-provided entity ID). Use this wherever the ID must survive SSR →
 * client hydration unchanged; use createClientId for IDs created at runtime
 * (e.g. when the user adds a new place).
 * @param prefix - Prefix prepended to the generated ID.
 * @param seed - Stable value that makes the ID deterministic.
 * @returns The deterministic client ID.
 */
export function createDeterministicId(prefix: string, seed: string): string {
  return `${prefix}-${seed}`;
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}
