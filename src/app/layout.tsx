import type { Metadata } from 'next';
import { Manrope, Outfit } from 'next/font/google';
import './globals.css';
import AuthInitializer from '@/components/auth/AuthInitializer';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

// Primary font - Used for body text, buttons, inputs, and most UI elements
const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  display: 'swap', // Better performance - shows fallback font until custom font loads
  weight: ['400', '500', '600', '700'], // Only load needed weights
});

// Secondary font - Used for headings and titles
const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Viargos',
  description: 'Discover and share amazing journeys and travel experiences',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${outfit.variable} antialiased`}>
        <AuthInitializer>
          {children}
          <SpeedInsights />
          <Analytics />
        </AuthInitializer>
      </body>
    </html>
  );
}
