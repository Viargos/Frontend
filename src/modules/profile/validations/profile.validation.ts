import { z } from 'zod';

export const profileIdSchema = z.uuid('Invalid user id');
