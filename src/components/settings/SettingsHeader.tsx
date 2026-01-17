import { useRouter } from 'next/navigation';
import { ChevronLeftIcon } from '@/components/icons';

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
            <ChevronLeftIcon className="w-6 h-6 text-gray-900" />
          </button>
        )}
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      </div>
    </div>
  );
}

