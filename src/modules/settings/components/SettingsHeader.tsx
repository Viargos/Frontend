'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeftIcon } from '@/modules/common';

type SettingsHeaderProps = {
  showBackButton?: boolean;
  title: string;
};

export const SettingsHeader = (props: SettingsHeaderProps) => {
  const { showBackButton, title } = props;
  const router = useRouter();
  const backButton = showBackButton
    ? (
        <button
          onClick={() => router.back()}
          className="mr-3 rounded-full p-1 transition-colors hover:bg-gray-100"
          aria-label="Go back"
          type="button"
        >
          <ChevronLeftIcon className="h-6 w-6 text-gray-900" />
        </button>
      )
    : null;

  return (
    <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
      <div className="flex items-center px-4 py-3">
        {backButton}
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      </div>
    </div>
  );
};
