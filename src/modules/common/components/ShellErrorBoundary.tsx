'use client';

import type { ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Component } from 'react';

type ShellErrorBoundaryProps = {
  children: ReactNode;
};

type ShellErrorBoundaryState = {
  hasError: boolean;
};

export class ShellErrorBoundary extends Component<
  ShellErrorBoundaryProps,
  ShellErrorBoundaryState
> {
  public constructor(props: ShellErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(): ShellErrorBoundaryState {
    return { hasError: true };
  }

  public override componentDidCatch(error: Error, info: ErrorInfo) {
    Sentry.captureException(error, {
      extra: {
        componentStack: info.componentStack,
      },
    });
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-6 text-gray-900">
          <h2 className="text-2xl font-bold">Unable to render this screen</h2>
          <p className="max-w-md text-center text-sm text-gray-600">
            A recoverable rendering issue occurred in the shell boundary.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
