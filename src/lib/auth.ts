import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase-admin';
import type { AdminSessionUser } from '@/types/admin';

export async function auth(): Promise<{ user: AdminSessionUser } | null> {
  try {
    const cookieStore     = await cookies();
    const sessionCookie   = cookieStore.get('__session')?.value;
    if (!sessionCookie) return null;

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return {
      user: {
        id:    decoded.uid,
        name:  decoded.name ?? decoded.email?.split('@')[0] ?? 'Admin',
        email: decoded.email ?? '',
        role:  'super_admin',
      },
    };
  } catch {
    return null;
  }
}
