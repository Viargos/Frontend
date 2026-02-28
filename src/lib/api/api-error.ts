export type ApiErrorPayload = {
  details?: Record<string, unknown>;
  error: string;
  message: string;
  statusCode: number;
};

export class ApiError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;
  public readonly statusCode: number;

  public constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = 'ApiError';
    this.code = payload.error;
    this.details = payload.details;
    this.statusCode = payload.statusCode;
  }
}
