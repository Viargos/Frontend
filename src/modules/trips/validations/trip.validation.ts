import { z } from 'zod';
import { TRIP_COPY } from '@/modules/trips/copy/trip.copy';

export const createTripSchema = z
  .object({
    currency: z.string().trim().length(3),
    description: z.string().trim().max(1000).optional(),
    endDate: z.string().optional(),
    flexibleDates: z.boolean(),
    pace: z.enum(['BALANCED', 'FAST', 'RELAXED']),
    startDate: z.string().optional(),
    timezone: z.string().trim().min(1),
    title: z.string().trim().min(1, TRIP_COPY.errors.validation).max(160),
    transportMode: z.enum(['BICYCLE', 'DRIVE', 'MIXED', 'TRANSIT', 'WALK']),
    travellerCount: z.number().int().min(1).max(100),
  })
  .superRefine((value, context) => {
    if (value.flexibleDates) {
      return;
    }

    if (!value.startDate) {
      context.addIssue({ code: 'custom', message: TRIP_COPY.errors.validation, path: ['startDate'] });
    }

    if (!value.endDate) {
      context.addIssue({ code: 'custom', message: TRIP_COPY.errors.validation, path: ['endDate'] });
    }

    if (value.startDate && value.endDate && value.endDate < value.startDate) {
      context.addIssue({ code: 'custom', message: TRIP_COPY.errors.validation, path: ['endDate'] });
    }
  });
