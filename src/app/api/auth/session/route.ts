import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { rateLimit } from '@/lib/rate-limit';

const ALLOWED_EMAILS = new Set([
  'concernrehab@gmail.com',
  'concernrehabb@gmail.com',
]);

const SESSION_SECONDS = 8 * 60 * 60; // 8 hours

export async function POST(req: NextRequest) {
  // Rate limit: 10 session attempts per minute per IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!rateLimit(`session:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await req.json().catch(() => ({})) as { idToken?: string };
    if (!body.idToken) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    const decoded = await adminAuth.verifyIdToken(body.idToken);

    if (!ALLOWED_EMAILS.has(decoded.email?.toLowerCase() ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const sessionCookie = await adminAuth.createSessionCookie(body.idToken, {
      expiresIn: SESSION_SECONDS * 1000,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set('__session', sessionCookie, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   SESSION_SECONDS,
      path:     '/',
    });
    return response;
  } catch (err) {
    console.error('[session] POST:', err);
    return NextResponse.json({ error: 'Session creation failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  // Revoke the Firebase session if we can decode it
  try {
    const cookie = req.cookies.get('__session')?.value;
    if (cookie) {
      const decoded = await adminAuth.verifySessionCookie(cookie).catch(() => null);
      if (decoded) await adminAuth.revokeRefreshTokens(decoded.sub);
    }
  } catch { /* best-effort */ }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('__session', '', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   0,
    path:     '/',
  });
  return response;
}
