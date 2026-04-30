import { z } from 'zod';
import { OTP_LENGTH } from '@/modules/auth/constants/auth.constants';

export const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z
  .object({
    confirmPassword: z.string(),
    email: z.email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phoneNumber: z.string().optional(),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username cannot exceed 20 characters')
      .regex(/^\w+$/, 'Username can only contain letters, numbers, and underscores'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const otpSchema = z.object({
  otp: z
    .string()
    .length(OTP_LENGTH, `OTP must be ${OTP_LENGTH} digits`)
    .regex(/^\d+$/, 'OTP must contain only digits'),
});

export const forgotPasswordSchema = z.object({
  email: z.email('Please enter a valid email address'),
});

export const resetPasswordSchema = z
  .object({
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type LoginSchemaValues = z.infer<typeof loginSchema>;
export type SignupSchemaValues = z.infer<typeof signupSchema>;
export type OtpSchemaValues = z.infer<typeof otpSchema>;
export type ForgotPasswordSchemaValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchemaValues = z.infer<typeof resetPasswordSchema>;
