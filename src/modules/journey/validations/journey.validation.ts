import { z } from 'zod';
import { PlaceType } from '@/modules/journey/enums/place-type.enum';

export const journeyPlaceSchema = z.object({
  address: z.string().optional(),
  description: z.string().optional(),
  endTime: z.string().optional(),
  id: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  name: z.string().min(1, 'Place name is required'),
  startTime: z.string().optional(),
  type: z.enum(PlaceType),
});

export const journeyDaySchema = z.object({
  date: z.string().min(1, 'Day date is required'),
  dayNumber: z.number().int().min(1),
  id: z.string().min(1),
  notes: z.string().optional(),
  places: z.array(journeyPlaceSchema),
});

export const journeyCreateSchema = z.object({
  days: z.array(journeyDaySchema).min(1, 'At least one day is required'),
  description: z.string().optional(),
  title: z.string().min(1, 'Journey title is required'),
});

export type JourneyCreateValues = z.infer<typeof journeyCreateSchema>;
