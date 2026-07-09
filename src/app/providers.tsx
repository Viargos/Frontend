'use client';

import type { PropsWithChildren } from 'react';
import { QueryProvider } from '@/lib/react-query/query-provider';
import { AppShell, ThemeProvider } from '@/modules/common';
import { PrimeReactProvider } from 'primereact/api';

export function AppProviders(props: PropsWithChildren) {
  const { children } = props;

  return (
    <PrimeReactProvider>
      <QueryProvider>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </QueryProvider>
    </PrimeReactProvider>
  );
}
