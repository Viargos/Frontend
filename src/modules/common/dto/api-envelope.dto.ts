export type ApiPagination = {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  nextCursor?: string;
};

export type ApiSuccess<TData> = {
  data: TData;
  pagination?: ApiPagination;
};

export type ApiError = {
  error: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
};

export type ApiResponse<TData> = ApiSuccess<TData> | ApiError;
