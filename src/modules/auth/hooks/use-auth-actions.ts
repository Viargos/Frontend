'use client';

import type {
  ForgotPasswordRequestDto,
  ResendOtpRequestDto,
  ResetPasswordRequestDto,
  SigninRequestDto,
  SignupRequestDto,
  VerifyOtpRequestDto,
} from '@/modules/auth/dto/auth.dto';
import { useCallback } from 'react';
import { authService } from '@/modules/auth/services/auth.service';

export function useAuthActions() {
  const forgotPassword = useCallback((payload: ForgotPasswordRequestDto) => authService.forgotPassword(payload), []);
  const resendOtp = useCallback((payload: ResendOtpRequestDto) => authService.resendOtp(payload), []);
  const resendVerification = useCallback((payload: ResendOtpRequestDto) => authService.resendVerification(payload), []);
  const resetPassword = useCallback((payload: ResetPasswordRequestDto) => authService.resetPassword(payload), []);
  const signin = useCallback((payload: SigninRequestDto) => authService.signin(payload), []);
  const signup = useCallback((payload: SignupRequestDto) => authService.signup(payload), []);
  const verifyEmail = useCallback((payload: VerifyOtpRequestDto) => authService.verifyEmail(payload), []);
  const verifyOtp = useCallback((payload: VerifyOtpRequestDto) => authService.verifyOtp(payload), []);

  return {
    forgotPassword,
    resendOtp,
    resendVerification,
    resetPassword,
    signin,
    signup,
    verifyEmail,
    verifyOtp,
  };
}
