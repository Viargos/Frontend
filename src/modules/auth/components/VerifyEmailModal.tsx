'use client';

import type { AuthUser } from '@/modules/auth/types/auth.types';
import { OtpVerificationForm } from '@/modules/auth/components/OtpVerificationForm';

type VerifyEmailModalProps = {
  email: string;
  onSuccess: (user: AuthUser | null) => void;
  onErrorChange: (message: string | null) => void;
};

export function VerifyEmailModal(props: VerifyEmailModalProps) {
  const { email, onErrorChange, onSuccess } = props;

  return (
    <OtpVerificationForm
      email={email}
      isPasswordReset={false}
      onErrorChange={onErrorChange}
      onSuccess={onSuccess}
    />
  );
}
