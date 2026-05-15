import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';
import './src/libs/Env';

// Define the base Next.js configuration
const baseConfig: NextConfig = {
  compress: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**', pathname: '/**' },
      { protocol: 'http', hostname: 'localhost', pathname: '/**' },
      { protocol: 'http', hostname: '127.0.0.1', pathname: '/**' },
    ],
  },
  experimental: {
    dynamicOnHover: true,
    fetchCacheKeyPrefix: 'v1',
    optimizePackageImports: ['@/modules/common', '@/modules/admin'],
    staleTimes: {
      dynamic: 120,
      static: 300,
    },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              'default-src \'self\'',
              'script-src \'self\' \'unsafe-eval\' \'unsafe-inline\' *.posthog.com *.vercel-insights.com va.vercel-scripts.com https://maps.googleapis.com https://maps.gstatic.com',
              'script-src-elem \'self\' \'unsafe-inline\' *.posthog.com *.vercel-insights.com va.vercel-scripts.com https://maps.googleapis.com https://maps.gstatic.com',
              'style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com',
              'style-src-elem \'self\' \'unsafe-inline\' https://fonts.googleapis.com',
              'img-src \'self\' blob: data: https:',
              'font-src \'self\' data: https://fonts.gstatic.com',
              'worker-src \'self\' blob:',
              'connect-src \'self\' *.posthog.com *.sentry.io *.vercel-insights.com vitals.vercel-insights.com https://maps.googleapis.com https://maps.gstatic.com ws: wss: http://localhost:* ws://localhost:* http://127.0.0.1:* ws://127.0.0.1:*',
              'frame-ancestors \'self\'',
              'base-uri \'self\'',
              'form-action \'self\'',
            ].join('; '),
          },
        ],
      },
    ];
  },
  devIndicators: {
    position: 'bottom-right',
  },
  poweredByHeader: false,
  reactStrictMode: true,
  reactCompiler: process.env.NODE_ENV === 'production', // Keep the development environment fast
};

let configWithPlugins: NextConfig = baseConfig;

// Conditionally enable bundle analysis
if (process.env.ANALYZE === 'true') {
  configWithPlugins = withBundleAnalyzer()(configWithPlugins);
}

// Conditionally enable Sentry configuration
if (!process.env.NEXT_PUBLIC_SENTRY_DISABLED) {
  configWithPlugins = withSentryConfig(configWithPlugins, {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options
    org: process.env.SENTRY_ORGANIZATION,
    project: process.env.SENTRY_PROJECT,

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    tunnelRoute: '/monitoring',

    webpack: {
      reactComponentAnnotation: {
        enabled: true,
      },

      // Tree-shake Sentry logger statements to reduce bundle size
      treeshake: {
        removeDebugLogging: true,
      },
    },

    // Disable Sentry telemetry
    telemetry: false,
  });
}

const nextConfig = configWithPlugins;
export default nextConfig;
