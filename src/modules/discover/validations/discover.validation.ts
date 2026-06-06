import { z } from 'zod';
import { DISCOVER_MAX_RADIUS_KM, DISCOVER_MIN_RADIUS_KM } from '@/modules/discover/constants/discover.constants';

export const discoverSearchSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().min(DISCOVER_MIN_RADIUS_KM).max(DISCOVER_MAX_RADIUS_KM),
  limit: z.number().min(1).max(50),
});
