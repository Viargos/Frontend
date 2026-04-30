import { z } from 'zod';
import { PlaceType } from '@/modules/journey/enums/place-type.enum';

export const journeyPlaceSchema = z.object({
  address: z.string().optional(),
  bookingEndDayNumber: z.number().int().positive().optional(),
  bookingGroupId: z.string().optional(),
  bookingStartDayNumber: z.number().int().positive().optional(),
  description: z.string().optional(),
  endTime: z.string().optional(),
  id: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  media: z.array(z.object({
    id: z.string().min(1),
    order: z.number().int().nonnegative().optional(),
    previewUrl: z.string().min(1),
    thumbnailUrl: z.string().optional(),
    type: z.enum(['image', 'video']),
    url: z.string().optional(),
  })).default([]),
  name: z.string().min(1, 'Place name is required'),
  order: z.number().int().nonnegative().optional(),
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
  coverImage: z.string().optional(),
  days: z.array(journeyDaySchema).min(1, 'At least one day is required'),
  description: z.string().optional(),
  title: z.string().min(1, 'Journey title is required'),
});

export type JourneyCreateValues = z.infer<typeof journeyCreateSchema>;
