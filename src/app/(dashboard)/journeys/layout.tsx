import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Journeys | Viargos',
  description: 'View and manage all your travel journeys',
};

export default function JourneysLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
