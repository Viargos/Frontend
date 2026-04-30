export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type RequestQuery = Record<string, string | number | boolean | undefined>;

export type HttpClientRequest = {
  path: string;
  method?: HttpMethod;
  query?: RequestQuery;
  headers?: HeadersInit;
  body?: BodyInit | null;
  cache?: RequestCache;
  credentials?: RequestCredentials;
  signal?: AbortSignal;
};
