import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Journey | Viargos',
  description: 'Create and share your travel journey',
};

export default function CreateJourneyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
