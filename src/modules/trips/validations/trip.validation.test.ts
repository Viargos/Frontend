import { describe, expect, it } from 'vitest';
import { createTripSchema } from '@/modules/trips/validations/trip.validation';

const validTrip = {
  currency: 'CAD',
  endDate: '2027-06-10',
  flexibleDates: false,
  pace: 'BALANCED' as const,
  startDate: '2027-06-01',
  timezone: 'America/Toronto',
  title: 'Lisbon in June',
  transportMode: 'TRANSIT' as const,
  travellerCount: 2,
};

describe('createTripSchema', () => {
  it('accepts a dated trip', () => {
    expect(createTripSchema.safeParse(validTrip).success).toBe(true);
  });

  it('rejects an inverted date range', () => {
    const result = createTripSchema.safeParse({
      ...validTrip,
      endDate: '2027-05-20',
    });

    expect(result.success).toBe(false);
  });

  it('accepts a flexible trip without dates', () => {
    const result = createTripSchema.safeParse({
      ...validTrip,
      endDate: undefined,
      flexibleDates: true,
      startDate: undefined,
    });

    expect(result.success).toBe(true);
  });
});
