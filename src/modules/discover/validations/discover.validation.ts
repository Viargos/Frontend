import { z } from 'zod';

export const discoverSearchSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().min(10).max(10000),
  limit: z.number().min(1).max(50),
});
