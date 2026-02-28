'use client';

import type { AuthSigninResult, AuthUser } from '@/modules/auth/types/auth.types';
import * as motion from 'framer-motion/client';
import { useMemo } from 'react';
import { AuthStep } from '@/modules/auth/enums/auth-step.enum';
import { MODAL_SURFACE_BASE_CLASS, MODAL_TRANSITION_DURATION_SECONDS, OVERLAY_BASE_CLASS } from '@/modules/common/constants';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { LoginForm } from './LoginForm';
import { OtpVerificationForm } from './OtpVerificationForm';
import { ResetPasswordForm } from './ResetPasswordForm';
import { SignupForm } from './SignupForm';
import { VerifyEmailModal } from './VerifyEmailModal';

type AuthModalProps = {
  isOpen: boolean;
  step: AuthStep;
  error: string | null;
  signupEmail: string;
  passwordResetEmail: string;
  isPasswordResetFlow: boolean;
  onClose: () => void;
  onErrorChange: (message: string | null) => void;
  onLoginSuccess: (result: AuthSigninResult) => void;
  onSignupSuccess: (email: string) => void;
  onForgotPasswordSuccess: (email: string) => void;
  onOtpSuccess: (user: AuthUser | null) => void;
  onSwitchStep: (step: AuthStep) => void;
};

function getOtpEmail(signupEmail: string, passwordResetEmail: string, isPasswordResetFlow: boolean): string {
  return isPasswordResetFlow ? passwordResetEmail : signupEmail;
}

export const AuthModal = (props: AuthModalProps) => {
  const {
    error,
    isOpen,
    isPasswordResetFlow,
    onClose,
    onErrorChange,
    onForgotPasswordSuccess,
    onLoginSuccess,
    onOtpSuccess,
    onSignupSuccess,
    onSwitchStep,
    passwordResetEmail,
    signupEmail,
    step,
  } = props;

  const title = useMemo(() => {
    switch (step) {
      case AuthStep.SIGNUP:
        return 'Create account';
      case AuthStep.OTP:
        return isPasswordResetFlow ? 'Verify Password Reset' : 'Verify your email';
      case AuthStep.FORGOT_PASSWORD:
        return 'Forgot Password';
      case AuthStep.RESET_PASSWORD:
        return 'Reset Password';
      case AuthStep.LOGIN:
      default:
        return 'Welcome back';
    }
  }, [isPasswordResetFlow, step]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`${OVERLAY_BASE_CLASS} p-4`}>
      <motion.div
        animate={{ y: 0, opacity: 1, scale: 1 }}
        className={`${MODAL_SURFACE_BASE_CLASS} max-w-md`}
        initial={{ y: 20, opacity: 0, scale: 0.98 }}
        transition={{ duration: MODAL_TRANSITION_DURATION_SECONDS }}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button
            aria-label="Close auth modal"
            className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {error
          ? (
              <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
                {error}
              </div>
            )
          : null}

        <div className="px-5 py-5">
          {step === AuthStep.LOGIN
            ? (
                <LoginForm
                  onErrorChange={onErrorChange}
                  onForgotPassword={() => onSwitchStep(AuthStep.FORGOT_PASSWORD)}
                  onSuccess={onLoginSuccess}
                  onSwitchToSignup={() => onSwitchStep(AuthStep.SIGNUP)}
                />
              )
            : null}

          {step === AuthStep.SIGNUP
            ? (
                <SignupForm
                  onErrorChange={onErrorChange}
                  onSuccess={onSignupSuccess}
                  onSwitchToLogin={() => onSwitchStep(AuthStep.LOGIN)}
                />
              )
            : null}

          {step === AuthStep.OTP
            ? (
                isPasswordResetFlow
                  ? (
                      <OtpVerificationForm
                        email={getOtpEmail(signupEmail, passwordResetEmail, isPasswordResetFlow)}
                        isPasswordReset={true}
                        onErrorChange={onErrorChange}
                        onSuccess={onOtpSuccess}
                      />
                    )
                  : (
                      <VerifyEmailModal
                        email={signupEmail}
                        onErrorChange={onErrorChange}
                        onSuccess={onOtpSuccess}
                      />
                    )
              )
            : null}

          {step === AuthStep.FORGOT_PASSWORD
            ? (
                <ForgotPasswordForm
                  onErrorChange={onErrorChange}
                  onSuccess={onForgotPasswordSuccess}
                  onSwitchToLogin={() => onSwitchStep(AuthStep.LOGIN)}
                />
              )
            : null}

          {step === AuthStep.RESET_PASSWORD
            ? (
                <ResetPasswordForm
                  email={passwordResetEmail}
                  onErrorChange={onErrorChange}
                  onSuccess={() => onSwitchStep(AuthStep.LOGIN)}
                  onSwitchToLogin={() => onSwitchStep(AuthStep.LOGIN)}
                />
              )
            : null}
        </div>
      </motion.div>
    </div>
  );
};
