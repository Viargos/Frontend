import type { Metadata } from 'next';
import {
  Geist,
  Geist_Mono,
  Manrope,
  Inter,
  Mulish,
  Outfit,
} from 'next/font/google';
import './globals.css';
import AuthInitializer from '@/components/auth/AuthInitializer';
import { SpeedInsights } from '@vercel/speed-insights/next';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const mulish = Mulish({
  variable: '--font-mulish',
  subsets: ['latin'],
});

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Viargos - Journey & Travel',
  description: 'Discover and share amazing journeys and travel experiences',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable} ${inter.variable} ${mulish.variable} ${outfit.variable} antialiased`}
      >
        <AuthInitializer>
          {children}
          <SpeedInsights />
        </AuthInitializer>
      </body>
    </html>
  );
}
