import { forwardTripRequest } from '@/app/api/_shared/trip-forward';

export function DELETE(request: Request) {
  return forwardTripRequest(request, []);
}

export function GET(request: Request) {
  return forwardTripRequest(request, []);
}

export function PATCH(request: Request) {
  return forwardTripRequest(request, []);
}

export function POST(request: Request) {
  return forwardTripRequest(request, []);
}
