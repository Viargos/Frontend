'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { profileQueryKeys } from '@/modules/profile/query-keys';
import { profileService } from '@/modules/profile/services/profile.service';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Only JPEG, PNG, WebP, or GIF images are allowed.';
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'Image must be smaller than 5 MB.';
  }
  return null;
}

export function useProfileImages() {
  const queryClient = useQueryClient();
  const invalidateCurrentProfile = () => {
    void queryClient.invalidateQueries({ queryKey: profileQueryKeys.current() });
  };

  const profileImageMutation = useMutation({
    mutationFn: (file: File) => profileService.uploadProfileImage(file),
    onSuccess: invalidateCurrentProfile,
  });

  const bannerImageMutation = useMutation({
    mutationFn: (file: File) => profileService.uploadBannerImage(file),
    onSuccess: invalidateCurrentProfile,
  });

  const deleteProfileImageMutation = useMutation({
    mutationFn: () => profileService.deleteProfileImage(),
    onSuccess: invalidateCurrentProfile,
  });

  const deleteBannerImageMutation = useMutation({
    mutationFn: () => profileService.deleteBannerImage(),
    onSuccess: invalidateCurrentProfile,
  });

  const handleProfileImageChange = useCallback(
    (file: File | null) => {
      if (!file) {
        return;
      }
      const error = validateImageFile(file);
      if (error) {
        profileImageMutation.reset();
        return;
      }
      profileImageMutation.mutate(file);
    },
    [profileImageMutation],
  );

  const handleBannerImageChange = useCallback(
    (file: File | null) => {
      if (!file) {
        return;
      }
      const error = validateImageFile(file);
      if (error) {
        bannerImageMutation.reset();
        return;
      }
      bannerImageMutation.mutate(file);
    },
    [bannerImageMutation],
  );

  const getValidationError = (file: File): string | null => validateImageFile(file);

  return {
    handleProfileImageChange,
    isUploadingProfileImage: profileImageMutation.isPending,
    profileImageError: profileImageMutation.error?.message ?? null,

    handleBannerImageChange,
    isUploadingBannerImage: bannerImageMutation.isPending,
    bannerImageError: bannerImageMutation.error?.message ?? null,

    deleteProfileImage: deleteProfileImageMutation.mutate,
    isDeletingProfileImage: deleteProfileImageMutation.isPending,

    deleteBannerImage: deleteBannerImageMutation.mutate,
    isDeletingBannerImage: deleteBannerImageMutation.isPending,

    getValidationError,
  };
}
