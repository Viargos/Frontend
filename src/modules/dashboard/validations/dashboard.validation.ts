import { z } from 'zod';

export const dashboardQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(50).optional(),
  location: z.string().optional(),
  search: z.string().optional(),
});

export type DashboardQueryValues = z.infer<typeof dashboardQuerySchema>;
