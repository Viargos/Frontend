import type { MetadataRoute } from 'next';
import { getAppUrl } from '@/lib/app-config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getAppUrl();
  const routes = [
    '/dashboard',
    '/products',
    '/categories',
    '/brands',
    '/inventory',
    '/orders',
    '/dealers',
    '/promotions',
    '/invoices',
    '/ai-logs',
    '/settings',
    '/login',
  ];

  return routes.map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));
}
