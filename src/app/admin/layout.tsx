/**
 * Admin area group layout.
 *
 * This layout applies to all /admin/* routes.
 * It intentionally has NO public site chrome (no Header, Navbar, Footer,
 * SplashScreen, or PageTransition).
 *
 * The root layout (src/app/layout.tsx) provides the <html>/<body> shell.
 * Authentication is enforced by src/middleware.ts.
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Admin Portal',
    template: '%s | Admin',
  },
  description: 'CONCERN NGO Social Media Management Portal',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No extra wrapper needed — root layout provides html/body.
  // Admin pages render directly without public site chrome.
  return <>{children}</>;
}
