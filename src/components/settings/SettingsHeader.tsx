import { useRouter } from 'next/navigation';

interface SettingsHeaderProps {
  title: string;
  showBackButton?: boolean;
}

export default function SettingsHeader({
  title,
  showBackButton = false,
}: SettingsHeaderProps) {
  const router = useRouter();

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center px-4 py-3">
        {showBackButton && (
          <button
            onClick={() => router.back()}
            className="mr-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      </div>
    </div>
  );
}

