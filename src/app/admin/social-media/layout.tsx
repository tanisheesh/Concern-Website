/**
 * Social Media Portal layout.
 *
 * Wraps all /admin/social-media/* pages with the sidebar shell.
 * Session is read server-side — the middleware already guarantees the user
 * is authenticated before this layout renders.
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/sidebar';
import type { AdminSessionUser } from '@/types/admin';
import { Toaster } from '@/components/ui/toaster';

export default async function SocialMediaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Double-check — middleware should have caught this, but be defensive
  if (!session?.user) {
    redirect('/admin/login');
  }

  const user = session.user as AdminSessionUser;

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <AdminSidebar user={user} />

      {/* Main content area — offset by sidebar width on desktop */}
      <div className="lg:pl-60">
        <main className="min-h-screen p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      <Toaster />
    </div>
  );
}
