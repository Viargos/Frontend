import { z } from 'zod';

export const changePasswordSchema = z
  .object({
    confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  })
  .refine(values => values.newPassword === values.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  });

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
