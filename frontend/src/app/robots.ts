import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default function robots(): MetadataRoute.Robots {
  const headersList = headers();
  const hostname = headersList.get('host') || '';
  
  // Detect if subdomain
  const parts = hostname.split('.');
  const isSubdomain = parts.length > 2 && !['www', 'api', 'localhost'].includes(parts[0]);
  const tenantSlug = isSubdomain ? parts[0] : null;

  if (tenantSlug) {
    return {
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/borrowed/', '/history/'],
      },
      sitemap: `https://${hostname}/sitemap.xml`,
    };
  }

  // Main domain robots
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/_next/',
    },
    sitemap: `https://${hostname}/sitemap.xml`,
  };
}
