'use client';

import type { ProfileUser } from '@/modules/profile/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { profileService } from '@/modules/profile/api';

const editProfileSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .or(z.literal(''))
    .optional(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(32, 'Username must be at most 32 characters')
    .regex(/^\w+$/, 'Only letters, numbers, and underscores')
    .or(z.literal(''))
    .optional(),
});

export type EditProfileValues = z.infer<typeof editProfileSchema>;

type UseEditProfileOptions = {
  initialUser: Pick<ProfileUser, 'username' | 'email'>;
  onSuccess?: () => void;
};

export function useEditProfile(options: UseEditProfileOptions) {
  const { initialUser, onSuccess } = options;
  const router = useRouter();
  const formValues: EditProfileValues = {
    email: initialUser.email ?? '',
    username: initialUser.username ?? '',
  };

  const form = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    values: formValues,
  });

  const mutation = useMutation({
    mutationFn: (values: EditProfileValues) => {
      const payload: Parameters<typeof profileService.updateProfile>[0] = {};
      if (values.username) {
        payload.username = values.username;
      }

      return profileService.updateProfile(payload);
    },
    onSuccess: () => {
      router.refresh();
      onSuccess?.();
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate(values);
  });

  return {
    error: mutation.error?.message ?? null,
    form,
    isPending: mutation.isPending,
    onSubmit,
  };
}
