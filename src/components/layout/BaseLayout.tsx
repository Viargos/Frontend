'use client';

import { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export interface BaseLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export default function BaseLayout({
  children,
  header,
  sidebar,
  footer,
  className = '',
}: BaseLayoutProps) {
  return (
    <ErrorBoundary>
      <div className={`min-h-screen bg-gray-50 ${className}`}>
        {header && <header className="sticky top-0 z-40">{header}</header>}
        
        <div className="flex flex-1">
          {sidebar && (
            <aside className="flex-shrink-0">
              {sidebar}
            </aside>
          )}
          
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
        
        {footer && <footer>{footer}</footer>}
      </div>
    </ErrorBoundary>
  );
}
