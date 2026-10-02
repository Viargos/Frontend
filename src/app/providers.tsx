'use client';

import type { PropsWithChildren } from 'react';
import { PrimeReactProvider } from 'primereact/api';
import { QueryProvider } from '@/lib/react-query/query-provider';
import { AppShell, ThemeBackgroundProvider, ThemeProvider } from '@/modules/common';

export function AppProviders(props: PropsWithChildren) {
  const { children } = props;

  return (
    <PrimeReactProvider>
      <QueryProvider>
        <ThemeProvider>
          <ThemeBackgroundProvider>
            <AppShell>{children}</AppShell>
          </ThemeBackgroundProvider>
        </ThemeProvider>
      </QueryProvider>
    </PrimeReactProvider>
  );
}
