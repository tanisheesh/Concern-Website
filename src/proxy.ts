/**
 * Next.js Proxy (formerly Middleware) — protects all /admin/* routes.
 *
 * Renamed from middleware.ts to proxy.ts per Next.js 16 convention.
 * See: https://nextjs.org/docs/messages/middleware-to-proxy
 *
 * Any request to /admin/* that does not have a valid Auth.js session is
 * redirected to /admin/login.
 *
 * The /admin/login route itself is always public so users can authenticate.
 * The /api/auth/* routes are always public (Auth.js internals).
 */

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const proxy = auth((req: NextRequest & { auth: unknown }) => {
  const { pathname } = req.nextUrl;

  // Always allow the login page and Auth.js API routes through
  if (
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }

  // Protect all other /admin/* routes
  if (pathname.startsWith('/admin')) {
    const session = (req as unknown as { auth: { user?: unknown } | null }).auth;

    if (!session?.user) {
      const loginUrl = new URL('/admin/login', req.url);
      // Preserve the original destination so we can redirect after login
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  /*
   * Match all /admin/* routes and /api/admin/* routes.
   * Exclude Next.js internals and static files so they are never intercepted.
   */
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
