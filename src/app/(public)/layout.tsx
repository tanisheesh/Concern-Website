/**
 * Public website layout.
 *
 * Wraps all public-facing pages with the existing AppClientShell
 * (SplashScreen, Header, ClientNavbar, PageTransition, Footer, Toaster, BackToTop).
 *
 * This layout is applied to all routes inside the (public) route group.
 * The route group name "(public)" is invisible in URLs.
 */

import AppClientShell from '@/components/app-client-shell';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <AppClientShell>
        {children}
      </AppClientShell>
    </div>
  );
}
