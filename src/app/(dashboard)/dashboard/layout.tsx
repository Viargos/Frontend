import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Viargos',
  description: 'Your personalized travel dashboard - Discover and share amazing journeys',
};

/**
 * Dashboard Route Layout
 * Provides metadata for the main dashboard page
 */
export default function DashboardPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
