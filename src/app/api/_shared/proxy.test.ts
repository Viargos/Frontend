import { afterEach, describe, expect, it, vi } from 'vitest';
import { proxyToBackend } from '@/app/api/_shared/proxy';

const requestOptions = {
  backendBaseUrl: 'http://localhost:3000',
  backendPath: '/notifications?limit=100',
  forwardCookies: false,
  request: new Request('http://localhost:3001/api/notifications?limit=100'),
};

describe('proxyToBackend', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns an unavailable response when the backend refuses a connection', async () => {
    const connectionError = Object.assign(new Error('connect ECONNREFUSED'), {
      code: 'ECONNREFUSED',
    });
    const fetchError = new TypeError('fetch failed', {
      cause: new AggregateError([connectionError], 'All backend connections failed'),
    });
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockRejectedValue(fetchError));

    const response = await proxyToBackend(requestOptions);

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: 'BACKEND_UNAVAILABLE',
      message: 'The backend service is unavailable.',
      statusCode: 503,
    });
  });

  it('returns an unavailable response when the backend body cannot be read', async () => {
    const body = new ReadableStream({
      start(controller) {
        controller.error(new TypeError('terminated'));
      },
    });
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(new Response(body)));

    const response = await proxyToBackend(requestOptions);

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: 'BACKEND_UNAVAILABLE',
      message: 'The backend service is unavailable.',
      statusCode: 503,
    });
  });

  it('preserves a backend error response', async () => {
    const payload = {
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An internal server error occurred.',
      statusCode: 500,
    };
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(Response.json(payload, {
      status: 500,
    })));

    const response = await proxyToBackend(requestOptions);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual(payload);
  });

  it('preserves a successful backend response', async () => {
    const payload = { data: { items: [], unreadCount: 0 } };
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(Response.json(payload)));

    const response = await proxyToBackend(requestOptions);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(payload);
  });
});
