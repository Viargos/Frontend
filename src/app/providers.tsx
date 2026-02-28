'use client';

import type { PropsWithChildren } from 'react';
import { QueryProvider } from '@/lib/react-query/query-provider';
import { AppShell } from '@/modules/common';

export function AppProviders(props: PropsWithChildren) {
  const { children } = props;

  return (
    <QueryProvider>
      <AppShell>{children}</AppShell>
    </QueryProvider>
  );
}
