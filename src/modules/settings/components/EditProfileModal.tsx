'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useRef } from 'react';
import { Button, Input, OverlayModal, Skeleton } from '@/modules/common';
import { CameraIcon, SpinnerIcon, XIcon } from '@/modules/common/icons';
import { profileQueryKeys, profileService, useProfileImages } from '@/modules/profile/api';
import { useEditProfile } from '@/modules/settings/hooks/use-edit-profile';

type EditProfileModalProps = {
  onClose: () => void;
};

function EditProfileSkeleton() {
  return (
    <div>
      <Skeleton className="h-28 w-full rounded-none sm:h-36" />
      <div className="px-5 pb-6">
        <Skeleton className="-mt-10 mb-6 h-20 w-20 rounded-xl" />
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-32 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function EditProfileModal(props: EditProfileModalProps) {
  const { onClose } = props;

  const bannerFileRef = useRef<HTMLInputElement>(null);
  const avatarFileRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: profileQueryKeys.current(),
    queryFn: () => profileService.getCurrentUserProfile(),
    staleTime: 0,
  });

  const {
    handleBannerImageChange,
    isUploadingBannerImage,
    bannerImageError,
    handleProfileImageChange,
    isUploadingProfileImage,
    profileImageError,
  } = useProfileImages();

  const { form, onSubmit, isPending, error } = useEditProfile({
    initialUser: profile?.user ?? { username: '', email: '' },
    onSuccess: onClose,
  });

  const { register, formState: { errors } } = form;
  const user = profile?.user;

  return (
    <OverlayModal ariaLabel="Edit profile" className="max-w-lg overflow-hidden" onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>
        <button
          aria-label="Close edit profile"
          className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          type="button"
          onClick={onClose}
        >
          <XIcon size={20} />
        </button>
      </div>

      {isLoading
        ? (
            <EditProfileSkeleton />
          )
        : (
            <>
              {/* Banner */}
              <div className="relative h-28 w-full overflow-hidden bg-gray-200 sm:h-36">
                {user?.bannerImage
                  ? (
                      <Image
                        alt="Profile banner"
                        className="h-full w-full object-cover"
                        fill
                        sizes="100vw"
                        src={user.bannerImage}
                        unoptimized
                      />
                    )
                  : (
                      <Image
                        alt="Profile banner"
                        className="h-full w-full object-cover"
                        height={144}
                        src="/london.png"
                        width={600}
                      />
                    )}

                <input
                  ref={bannerFileRef}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  aria-label="Upload banner image"
                  className="sr-only"
                  type="file"
                  onChange={(e) => {
                    handleBannerImageChange(e.target.files?.[0] ?? null);
                    e.target.value = '';
                  }}
                />

                <button
                  className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 text-white opacity-0 transition-all hover:bg-black/40 hover:opacity-100 disabled:cursor-not-allowed"
                  disabled={isUploadingBannerImage}
                  type="button"
                  onClick={() => bannerFileRef.current?.click()}
                >
                  {isUploadingBannerImage
                    ? (
                        <SpinnerIcon className="animate-spin" size={28} />
                      )
                    : (
                        <>
                          <CameraIcon size={20} />
                          <span className="text-sm font-medium">Change banner</span>
                        </>
                      )}
                </button>

                {bannerImageError
                  ? (
                      <p className="absolute right-2 bottom-2 rounded bg-red-500/90 px-2 py-0.5 text-xs text-white">
                        {bannerImageError}
                      </p>
                    )
                  : null}
              </div>

              <div className="px-5 pb-6">
                {/* Avatar */}
                <div className="relative -mt-10 mb-6 h-20 w-20">
                  {user?.profileImage
                    ? (
                        <Image
                          alt="Profile photo"
                          className="h-20 w-20 rounded-xl object-cover ring-4 ring-white"
                          height={80}
                          src={user.profileImage}
                          unoptimized
                          width={80}
                        />
                      )
                    : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-[#160E53] text-xl font-bold text-white ring-4 ring-white">
                          {user?.username?.charAt(0).toUpperCase() ?? 'U'}
                        </div>
                      )}

                  <input
                    ref={avatarFileRef}
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    aria-label="Upload profile photo"
                    className="sr-only"
                    type="file"
                    onChange={(e) => {
                      handleProfileImageChange(e.target.files?.[0] ?? null);
                      e.target.value = '';
                    }}
                  />

                  <button
                    aria-label="Change profile photo"
                    className="absolute inset-0 flex h-20 w-20 items-center justify-center rounded-xl bg-black/0 text-white opacity-0 transition-all hover:bg-black/50 hover:opacity-100 disabled:cursor-not-allowed"
                    disabled={isUploadingProfileImage}
                    type="button"
                    onClick={() => avatarFileRef.current?.click()}
                  >
                    {isUploadingProfileImage
                      ? (
                          <SpinnerIcon className="animate-spin" size={20} />
                        )
                      : (
                          <CameraIcon size={20} />
                        )}
                  </button>

                  {profileImageError
                    ? (
                        <p className="absolute -bottom-5 left-0 text-xs whitespace-nowrap text-red-500">
                          {profileImageError}
                        </p>
                      )
                    : null}
                </div>

                {/* Form */}
                <form className="space-y-4" onSubmit={onSubmit}>
                  {error
                    ? (
                        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                          {error}
                        </p>
                      )
                    : null}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700" htmlFor="ep-username">
                        Username
                      </label>
                      <Input
                        id="ep-username"
                        placeholder="your_username"
                        {...register('username')}
                      />
                      {errors.username
                        ? (
                            <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>
                          )
                        : null}
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700" htmlFor="ep-email">
                        Email
                      </label>
                      <Input
                        disabled
                        id="ep-email"
                        placeholder="you@example.com"
                        type="email"
                        {...register('email')}
                      />
                      {errors.email
                        ? (
                            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                          )
                        : null}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button size="md" type="button" variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button disabled={isPending} size="md" type="submit">
                      {isPending ? 'Saving…' : 'Save changes'}
                    </Button>
                  </div>
                </form>
              </div>
            </>
          )}
    </OverlayModal>
  );
}
