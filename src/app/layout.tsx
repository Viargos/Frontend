import type { Metadata } from 'next';
import { AppProviders } from '@/app/providers';
import '@/styles/global.css';

export const metadata: Metadata = {
  title: 'Viargos',
  description: 'Discover and share amazing journeys and travel experiences',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppProviders>{props.children}</AppProviders>
      </body>
    </html>
  );
}
