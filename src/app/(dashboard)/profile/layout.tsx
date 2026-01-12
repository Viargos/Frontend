import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile | Viargos',
  description: 'View and manage your profile, journeys, and posts',
};

/**
 * Profile Layout - Special layout within dashboard
 * Provides full-width layout for profile content
 */
export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 p-4 sm:p-6 max-w-none">
      {children}
    </div>
  );
}
