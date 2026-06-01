import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LoginForm from './login-form';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user) redirect('/admin/smp');
  return <LoginForm />;
}
