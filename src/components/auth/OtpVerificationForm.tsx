"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/store/auth.store";
import { AuthApi, ApiError, ApiErrorCode } from "@/lib/api";
import { SpinnerIcon } from "@/components/icons";

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

type OtpFormData = z.infer<typeof otpSchema>;

interface OtpVerificationFormProps {
  email: string;
  onSuccess?: () => void;
  onResendOtp?: () => void;
  isPasswordReset?: boolean;
  onError?: (message: string) => void; // Callback to report errors to parent
  onClearError?: () => void; // Callback to clear errors
}

export default function OtpVerificationForm({
  email,
  onSuccess,
  onResendOtp,
  isPasswordReset = false,
  onError,
  onClearError,
}: OtpVerificationFormProps) {
  const { setUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  const otpValue = watch("otp") || "";

  // Track if form has been submitted to prevent auto-submitting in a loop
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    // Only auto-submit when 6 digits are entered, not loading, and not previously submitted
    if (otpValue.length === 6 && !isSubmitting && !hasSubmitted) {
      setHasSubmitted(true);
      // Small delay to ensure the last digit is properly set
      const timer = setTimeout(() => {
        handleSubmit(onSubmit)();
      }, 100);
      return () => clearTimeout(timer);
    } else if (otpValue.length < 6) {
      // Reset submission flag when OTP is changed/cleared
      setHasSubmitted(false);
    }
  }, [otpValue, isSubmitting, hasSubmitted]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const onSubmit = async (data: OtpFormData) => {
    onClearError?.();
    setIsSubmitting(true);

    try {
      // Call AuthApi to verify OTP (handles cookie setting for signup flow)
      const result = await AuthApi.verifyOtp({
        email,
        otp: data.otp,
      });

      // Extract user from response
      const user = result.user;

      if (!user?.id || !user?.email) {
        onError?.('Invalid response format');
        setHasSubmitted(false);
        return;
      }

      // Only update store if this is signup verification (not password reset)
      if (!isPasswordReset) {
        setUser(user);
      }

      // Call the success callback (handles modal closing and redirect)
      onSuccess?.();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.is(ApiErrorCode.INVALID_OTP)) {
          onError?.('Invalid or expired verification code. Please try again.');
        } else {
          onError?.(error.getUserMessage());
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        onError?.(errorMessage);
      }
      // Allow resubmission after error
      setHasSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = otpValue.split("");
    newOtp[index] = value;
    const otpString = newOtp.join("");
    setValue("otp", otpString);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpValue[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setResendTimer(60);

    try {
      await AuthApi.resendOtp({ email });
      onClearError?.();
      // Successfully resent OTP
    } catch (error) {
      if (error instanceof ApiError) {
        onError?.(error.getUserMessage());
      } else {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        onError?.(errorMessage);
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isPasswordReset ? 'Verify Password Reset' : 'Verify your email'}
        </h2>
        <p className="text-gray-600">
          {isPasswordReset
            ? `We've sent a password reset code to `
            : `We've sent a verification code to `}
          <span className="font-medium">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
            Enter the 6-digit code
          </label>
          <div className="flex justify-center space-x-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                aria-label={`OTP digit ${index + 1}`}
                className="w-12 h-12 text-center border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium text-black"
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyPress={(e) => {
                  // Only allow digits
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                onKeyDown={(e) => handleKeyDown(index, e)}
                value={otpValue[index] || ""}
              />
            ))}
          </div>
          {errors.otp && (
            <p className="mt-2 text-sm text-red-600 text-center">
              {errors.otp.message}
            </p>
          )}
        </div>

        <div className="text-center">
                  <p className="text-sm text-gray-600">
          Didn&apos;t receive the code?{" "}
            {resendTimer > 0 ? (
              <span className="text-gray-500">Resend in {resendTimer}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Resend code
              </button>
            )}
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || otpValue.length !== 6}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#160E53] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <SpinnerIcon className="-ml-1 mr-3 h-5 w-5 text-white" />
              Verifying...
            </div>
          ) : (
            isPasswordReset ? "Verify Code" : "Verify email"
          )}
        </button>
      </form>
    </div>
  );
}
