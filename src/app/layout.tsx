import type { Metadata } from 'next';
import { Manrope, Outfit } from 'next/font/google';
import Script from 'next/script';
import { AppProviders } from '@/app/providers';
import '@/styles/global.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

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
    icon: '/viargos-favicon.png',
    shortcut: '/viargos-favicon.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} ${outfit.variable} antialiased`}>
        <Script id="theme-bootstrap" strategy="beforeInteractive">
          {`
            (function() {
              var theme = 'light';
              try {
                var storedTheme = window.localStorage.getItem('viargos-theme');
                if (storedTheme === 'dark' || storedTheme === 'light') {
                  theme = storedTheme;
                }
              } catch (error) {}

              document.documentElement.dataset.theme = theme;
              document.documentElement.style.colorScheme = theme;
            })();
          `}
        </Script>
        <AppProviders>{props.children}</AppProviders>
      </body>
    </html>
  );
}
