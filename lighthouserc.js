/**
 * Lighthouse CI configuration.
 * Runs performance, accessibility, best practices, and SEO audits.
 *
 * Usage:
 * 1. Install: npm install -D `@lhci/cli`
 * 2. Build: npm run build
 * 3. Run: npm run lighthouse
 */

module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run start',
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/counter',
        'http://localhost:3000/about',
        'http://localhost:3000/portfolio',
      ],
      numberOfRuns: 3, // Run 3 times and take median
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        // Performance
        'categories:performance': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],

        // Accessibility
        'categories:accessibility': ['error', { minScore: 0.9 }],

        // Best Practices
        'categories:best-practices': ['error', { minScore: 0.9 }],

        // SEO
        'categories:seo': ['error', { minScore: 0.9 }],

        // Progressive Web App (optional)
        'categories:pwa': 'off', // Disable PWA checks

        // Resource budgets
        'resource-summary:script:size': ['error', { maxNumericValue: 500000 }], // 500KB
        'resource-summary:total:size': ['warn', { maxNumericValue: 1000000 }], // 1MB
      },
    },
    upload: {
      target: 'temporary-public-storage', // Or configure your own LHCI server
    },
  },
};
