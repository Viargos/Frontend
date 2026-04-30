# Deployment Guide

This guide covers deploying your Next.js application to production.

## Pre-Deployment Checklist

Before deploying, complete the [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md).

## Environment Variables

### Required for Production

```bash
# Application
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# External API
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com

# Error Monitoring (Sentry)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORGANIZATION=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=sntrys_xxx # For source map upload

# Analytics (PostHog)
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Logging
NEXT_PUBLIC_LOGGING_LEVEL=warn # or 'info' for more verbose
```

### Optional

```bash
# Disable Sentry (for staging/dev environments)
NEXT_PUBLIC_SENTRY_DISABLED=true
```

## Vercel Deployment (Recommended)

Vercel is the easiest deployment option with zero configuration.

### Initial Setup

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Link project:**
   ```bash
   vercel link
   ```

4. **Set environment variables:**
   ```bash
   # Production variables
   vercel env add NEXT_PUBLIC_APP_URL production
   vercel env add NEXT_PUBLIC_API_BASE_URL production
   vercel env add NEXT_PUBLIC_SENTRY_DSN production
   # ... add all required variables
   ```

5. **Deploy:**
   ```bash
   # Preview deployment
   vercel

   # Production deployment
   vercel --prod
   ```

### Automatic Deployments

1. **Connect GitHub repository:**
   - Go to https://vercel.com
   - Import your repository
   - Configure project settings

2. **Configure branches:**
   - `main` → Production
   - `develop` → Preview
   - Feature branches → Preview

3. **Environment variables:**
   - Set in Vercel dashboard
   - Different values for Production/Preview/Development

### Build Configuration

Vercel auto-detects Next.js projects. If needed:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

## Netlify Deployment

### Initial Setup

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login:**
   ```bash
   netlify login
   ```

3. **Initialize site:**
   ```bash
   netlify init
   ```

4. **Configure build:**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Functions directory: (leave empty)

5. **Set environment variables:**
   ```bash
   netlify env:set NEXT_PUBLIC_APP_URL https://yourdomain.com
   # ... add all required variables
   ```

6. **Deploy:**
   ```bash
   # Preview
   netlify deploy

   # Production
   netlify deploy --prod
   ```

### netlify.toml Configuration

Create `netlify.toml` in project root:

```toml
[build]
command = "npm run build"
publish = ".next"

[[plugins]]
package = "@netlify/plugin-nextjs"

[[headers]]
for = "/*"

[headers.values]
X-Frame-Options = "SAMEORIGIN"
X-Content-Type-Options = "nosniff"
Referrer-Policy = "strict-origin-when-cross-origin"
```

## Docker Deployment

### Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

# Set to production
ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose port
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start application
CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NEXT_PUBLIC_APP_URL=https://yourdomain.com
      - NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
      - NEXT_PUBLIC_SENTRY_DSN=${SENTRY_DSN}
      - NEXT_PUBLIC_POSTHOG_KEY=${POSTHOG_KEY}
    restart: unless-stopped
```

### Build and Run

```bash
# Build image
docker build -t nextjs-app .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_APP_URL=https://yourdomain.com \
  -e NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com \
  nextjs-app

# Or use docker-compose
docker-compose up -d
```

### Update next.config.ts

Enable standalone output:

```typescript
const baseConfig: NextConfig = {
  output: 'standalone', // Add this line
  // ... rest of config
};
```

## Custom Server (Node.js)

### Build

```bash
npm run build
```

### Start

```bash
npm run start
```

### PM2 Process Manager

1. **Install PM2:**
   ```bash
   npm install -g pm2
   ```

2. **Create ecosystem.config.js:**
   ```javascript
   module.exports = {
     apps: [{
       name: 'nextjs-app',
       script: 'npm',
       args: 'start',
       env: {
         NODE_ENV: 'production',
         PORT: 3000,
       },
       instances: 'max',
       exec_mode: 'cluster',
     }],
   };
   ```

3. **Start with PM2:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

## CDN Configuration

### CloudFlare

1. Add your domain to CloudFlare
2. Set DNS records to point to your deployment
3. Enable:
   - Auto Minify (HTML, CSS, JS)
   - Brotli compression
   - HTTP/3
4. Cache rules:
   - Cache static assets: `/_next/static/*`

### AWS CloudFront

1. Create CloudFront distribution
2. Origin: Your deployment URL
3. Cache behaviors:
   - Default: Cache optimized
   - `/_next/static/*`: Cache everything
4. Custom headers match your next.config.ts headers

## Database & External Services

This boilerplate is frontend-only and calls external APIs.

### Ensure your external API:
- Has CORS configured for your domain
- Accepts requests from your production URL
- Has proper rate limiting
- Returns appropriate cache headers

## Monitoring Setup

### Sentry

1. Create project at https://sentry.io
2. Get DSN from project settings
3. Set `NEXT_PUBLIC_SENTRY_DSN` environment variable
4. Set `SENTRY_AUTH_TOKEN` for source map uploads
5. Deploy - errors will appear in Sentry dashboard

### PostHog

1. Create project at https://posthog.com
2. Get project key
3. Set `NEXT_PUBLIC_POSTHOG_KEY` environment variable
4. Deploy - analytics will start flowing

### Vercel Analytics

Automatically enabled on Vercel deployments. View at:
https://vercel.com/<your-project>/analytics

## SSL/TLS Configuration

### Vercel/Netlify
- Automatic HTTPS with free SSL certificates
- Auto-renewal

### Custom Server
1. Get certificate from Let's Encrypt:
   ```bash
   certbot certonly --webroot -w /var/www/html -d yourdomain.com
   ```

2. Configure nginx:
   ```nginx
   server {
     listen 443 ssl http2;
     server_name yourdomain.com;

     ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
     ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

## Performance Optimization

### Vercel Edge Network
- Automatically uses Vercel's global CDN
- Static assets cached at edge locations
- ISR pages served from cache

### Custom CDN
1. Deploy to your server
2. Add CDN (CloudFlare, CloudFront)
3. Configure caching:
   - `/_next/static/*`: Cache 1 year
   - Pages: Cache based on ISR config
   - API routes: No cache

## Rollback Strategy

### Vercel
```bash
# List deployments
vercel ls

# Promote previous deployment to production
vercel promote <deployment-url>
```

### Git-based
```bash
# Revert commit
git revert HEAD
git push origin main

# Or rollback to specific commit
git reset --hard <commit-hash>
git push origin main --force
```

### Docker
```bash
# Keep previous image tagged
docker tag nextjs-app:latest nextjs-app:previous

# Rollback
docker stop nextjs-app
docker run -d --name nextjs-app nextjs-app:previous
```

## Health Checks

This boilerplate follows a **frontend-only architecture** without API routes. For health monitoring:

1. **Monitor your homepage or critical pages** (e.g., `/`, `/about`, `/counter`)
2. **Use external monitoring services** like UptimeRobot or Pingdom
3. **Configure your load balancer** to check page availability (expect 200 status)

See [MONITORING.md](./MONITORING.md) for detailed monitoring setup.

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common deployment issues.

## Post-Deployment

1. **Verify deployment:**
   - Test critical user flows
   - Check error monitoring (Sentry)
   - Verify analytics (PostHog)
   - Run Lighthouse audit

2. **Monitor for 24 hours:**
   - Watch error rates
   - Check performance metrics
   - Review user feedback

3. **Update documentation:**
   - Record deployment date
   - Note any issues encountered
   - Update runbook if needed

## Support

- Vercel: https://vercel.com/support
- Netlify: https://www.netlify.com/support/
- Next.js: https://github.com/vercel/next.js/discussions
