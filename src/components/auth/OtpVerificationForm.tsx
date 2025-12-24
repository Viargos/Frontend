"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/store/auth.store";

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

type OtpFormData = z.infer<typeof otpSchema>;

interface OtpVerificationFormProps {
  email: string;
  onSuccess?: () => void;
  onResendOtp?: () => void;
  isPasswordReset?: boolean;
}

export default function OtpVerificationForm({
  email,
  onSuccess,
  onResendOtp,
  isPasswordReset = false,
}: OtpVerificationFormProps) {
  const { verifyOtp, isLoading, error } = useAuthStore();
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
    if (otpValue.length === 6 && !isLoading && !hasSubmitted) {
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
  }, [otpValue, isLoading, hasSubmitted]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const onSubmit = async (data: OtpFormData) => {
    try {
      const result = await verifyOtp(email, data.otp, isPasswordReset);
      
      if (result.success) {
        // Call the success callback (handles modal closing and redirect)
        onSuccess?.();
      } else {
        // If verification failed, allow resubmission
        setHasSubmitted(false);
      }
    } catch (error) {
      // Error is handled in the store
      // Allow resubmission after error
      setHasSubmitted(false);
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
    setResendTimer(60);
    try {
      await onResendOtp?.();
    } catch (error) {
      // Error is handled by parent component
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
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

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
          disabled={isLoading || otpValue.length !== 6}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
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
