import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session      = request.cookies.get('__session')?.value;

  // /admin root → login
  if (pathname === '/admin' || pathname === '/admin/') {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // /admin/smp requires a valid session
  if (pathname.startsWith('/admin/smp')) {
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Already logged in and hitting login → go to portal
  if (pathname === '/admin/login' && session) {
    return NextResponse.redirect(new URL('/admin/smp', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
