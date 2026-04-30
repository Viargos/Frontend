import type { Metadata } from 'next';
import { Manrope, Outfit } from 'next/font/google';
import { AppProviders } from '@/app/providers';
import '@/styles/global.css';

const manrope = Manrope({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-manrope',
});

const outfit = Outfit({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-outfit',
});

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
      <body className={`${manrope.variable} ${outfit.variable} antialiased`}>
        <AppProviders>{props.children}</AppProviders>
      </body>
    </html>
  );
}
