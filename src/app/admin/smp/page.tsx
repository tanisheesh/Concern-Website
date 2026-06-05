import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Portal from './portal';
import type { AdminSessionUser } from '@/types/admin';

export const dynamic = 'force-dynamic';

export default async function SmpPage() {
  const session = await auth();
  if (!session?.user) redirect('/admin/login');
  return <Portal user={session.user as AdminSessionUser} />;
}
