'use client';

import type { AuthUser } from '@/modules/auth/types/auth.types';
import type { OtpSchemaValues } from '@/modules/auth/validations/auth.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { OTP_LENGTH, OTP_RESEND_SECONDS, VERIFICATION_RESEND_SECONDS } from '@/modules/auth/constants/auth.constants';
import { useAuthActions } from '@/modules/auth/hooks/use-auth-actions';
import { toAuthServiceError } from '@/modules/auth/services/auth.errors';
import { otpSchema } from '@/modules/auth/validations/auth.validation';
import { Button } from '@/modules/common';

type OtpVerificationFormProps = {
  email: string;
  isPasswordReset: boolean;
  onSuccess: (user: AuthUser | null) => void;
  onErrorChange: (message: string | null) => void;
};

const OTP_INPUT_KEYS = ['otp-1', 'otp-2', 'otp-3', 'otp-4', 'otp-5', 'otp-6'] as const;

export const OtpVerificationForm = (props: OtpVerificationFormProps) => {
  const { email, isPasswordReset, onErrorChange, onSuccess } = props;
  const { resendOtp, resendVerification, verifyEmail, verifyOtp } = useAuthActions();
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const lastAutoSubmittedOtpRef = useRef<string | null>(null);
  const otpInputClassName = 'h-11 w-11 rounded-lg border border-gray-300 bg-white text-center text-lg text-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    setValue,
    watch,
  } = useForm<OtpSchemaValues>({
    resolver: zodResolver(otpSchema),
  });

  const otp = watch('otp') ?? '';

  const onSubmit = useCallback(async (values: OtpSchemaValues) => {
    onErrorChange(null);

    try {
      const user = isPasswordReset
        ? await verifyOtp({ email, otp: values.otp })
        : await verifyEmail({ email, otp: values.otp });
      onSuccess(user);
    } catch (error) {
      const normalized = toAuthServiceError(error);
      onErrorChange(normalized.message);
    }
  }, [email, isPasswordReset, onErrorChange, onSuccess, verifyEmail, verifyOtp]);

  useEffect(() => {
    if (otp.length < OTP_LENGTH) {
      lastAutoSubmittedOtpRef.current = null;
      return;
    }

    if (isSubmitting || lastAutoSubmittedOtpRef.current === otp) {
      return;
    }

    lastAutoSubmittedOtpRef.current = otp;
    void handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit, isSubmitting, otp]);

  useEffect(() => {
    if (resendTimer <= 0) {
      return;
    }

    const timer = window.setTimeout(() => setResendTimer(prev => prev - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) {
      return;
    }

    const nextChars = Array.from({ length: OTP_LENGTH }, (_, idx) => otp[idx] ?? '');
    nextChars[index] = value;
    const nextOtp = nextChars.join('').trimEnd();
    setValue('otp', nextOtp, { shouldValidate: true });

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    onErrorChange(null);
    setResendTimer(isPasswordReset ? OTP_RESEND_SECONDS : VERIFICATION_RESEND_SECONDS);

    try {
      if (isPasswordReset) {
        await resendOtp({ email });
      } else {
        await resendVerification({ email });
      }
    } catch (error) {
      const normalized = toAuthServiceError(error);
      onErrorChange(normalized.message);
    }
  };

  return (
    <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
      <p className="text-sm text-gray-600">
        {isPasswordReset ? 'We sent a password reset code to ' : 'We sent a verification code to '}
        <span className="font-medium">{email}</span>
      </p>

      <div className="flex justify-center gap-2">
        {OTP_INPUT_KEYS.map((inputKey, index) => (
          <input
            key={inputKey}
            ref={(input) => {
              inputRefs.current[index] = input;
            }}
            aria-label={`OTP digit ${index + 1}`}
            className={otpInputClassName}
            inputMode="numeric"
            maxLength={1}
            type="text"
            value={otp[index] ?? ''}
            onChange={event => handleOtpChange(index, event.target.value)}
            onKeyDown={event => handleKeyDown(index, event)}
          />
        ))}
      </div>

      {errors.otp ? <p className="text-center text-xs text-red-400">{errors.otp.message}</p> : null}

      <div className="text-center text-sm text-gray-500">
        {resendTimer > 0
          ? (
              <span>
                Resend in
                {resendTimer}
                s
              </span>
            )
          : (
              <button className="text-[#160E53] hover:text-blue-700" type="button" onClick={handleResendOtp}>
                Resend code
              </button>
            )}
      </div>

      <Button className="w-full" disabled={isSubmitting || otp.length !== OTP_LENGTH} type="submit" variant="default">
        {isSubmitting ? 'Verifying...' : isPasswordReset ? 'Verify code' : 'Verify email'}
      </Button>
    </form>
  );
};
