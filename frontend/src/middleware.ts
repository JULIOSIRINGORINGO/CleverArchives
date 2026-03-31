import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
 
const intlMiddleware = createMiddleware({
  locales: ['en', 'id'],
  defaultLocale: 'en'
});

export default function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // Tenant Resolution (following multi-tenant-architecture skill Step 5)
  const hostOnly = hostname.split(':')[0]; // Strip port
  const parts = hostOnly.split('.');
  
  // A tenant subdomain must have more than 2 parts (e.g. tenant.lvh.me)
  // or exactly 2 parts if it's not localhost (e.g. tenant.com - but we use subdomains)
  const isSubdomain = parts.length >= 3 && !['www', 'api', 'localhost'].includes(parts[0]);
  const tenantSlug = isSubdomain ? parts[0] : null;

  // Define protected routes
  const isProtectedRoute = 
    pathname.includes('/dashboard') || 
    pathname.includes('/cart') || 
    pathname.includes('/checkout') || 
    pathname.includes('/profil') ||
    pathname.includes('/borrowed') ||
    pathname.includes('/history');

  if (isProtectedRoute && !token) {
    const locale = pathname.split('/')[1] || 'en';
    const loginUrl = new URL(`/${locale}?login=true`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Inject tenant header into request for internal context propagation
  const response = intlMiddleware(request);
  if (tenantSlug) {
    response.headers.set('x-tenant-slug', tenantSlug);
  }
  
  return response;
}
 
export const config = {
  // Match all pathnames except for:
  // - API routes
  // - _next (static files)
  // - _vercel (Vercel specific files)
  // - Static files (e.g. favicon.ico, sitemap.xml, robots.txt)
  matcher: ['/((?!api|_next|_vercel|[\\w-]+\\.\\w+).*)', '/', '/(id|en)/:path*']
};
