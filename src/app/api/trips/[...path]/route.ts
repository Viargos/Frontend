import { forwardTripRequest } from '@/app/api/_shared/trip-forward';

async function forward(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return forwardTripRequest(request, path);
}

export const DELETE = forward;
export const GET = forward;
export const PATCH = forward;
export const POST = forward;
export const PUT = forward;
