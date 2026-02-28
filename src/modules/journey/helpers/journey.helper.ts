export function createClientId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}
