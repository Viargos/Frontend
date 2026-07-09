'use client';

import { Suspense } from 'react';
import { ShellErrorBoundary } from './ShellErrorBoundary';
import { ShellLoadingBoundary } from './ShellLoadingBoundary';
import { Toaster } from './Toaster';

export const AppShell = (props: { children: React.ReactNode }) => {
  return (
    <ShellErrorBoundary>
      <Suspense fallback={<ShellLoadingBoundary />}>
        <main className="min-h-screen">{props.children}</main>
        <Toaster />
      </Suspense>
    </ShellErrorBoundary>
  );
};
