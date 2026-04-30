import { NextResponse } from 'next/server';

export function getBackendBaseUrl(): string {
  const backendBaseUrl = process.env.BACKEND_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!backendBaseUrl) {
    throw new Error('Missing BACKEND_API_BASE_URL or NEXT_PUBLIC_API_BASE_URL');
  }

  return backendBaseUrl.replace(/\/$/, '');
}

export function backendConfigErrorResponse(): Response {
  return NextResponse.json(
    {
      error: 'BACKEND_CONFIG_ERROR',
      message: 'Backend base URL is not configured',
      statusCode: 500,
    },
    { status: 500 },
  );
}
