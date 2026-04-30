'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { mapChangePasswordValuesToDto } from '@/modules/settings/mappers/settings.mapper';
import { settingsService } from '@/modules/settings/services/settings.service';
import { changePasswordSchema } from '@/modules/settings/validations/settings.validation';

export function useChangePassword() {
  const router = useRouter();
  const redirectTimerRef = useRef<number | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        window.clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const submit = async () => {
    const parsed = changePasswordSchema.safeParse({
      confirmPassword,
      currentPassword,
      newPassword,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid password values');
      setSuccess(null);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await settingsService.changePassword(mapChangePasswordValuesToDto(parsed.data));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
      setSuccess(response.message);
      if (redirectTimerRef.current) {
        window.clearTimeout(redirectTimerRef.current);
      }
      redirectTimerRef.current = window.setTimeout(() => {
        router.push('/settings');
      }, 1200);
    } catch (caught) {
      setSuccess(null);
      setError(caught instanceof Error ? caught.message : 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    confirmPassword,
    currentPassword,
    error,
    isSubmitting,
    newPassword,
    setConfirmPassword,
    setCurrentPassword,
    setNewPassword,
    submit,
    success,
  };
}
