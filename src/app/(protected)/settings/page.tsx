import { Suspense } from 'react';
import { SettingsPageClient, SettingsPageSkeleton } from '@/modules/settings';

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsPageSkeleton />}>
      <SettingsPageClient />
    </Suspense>
  );
}
