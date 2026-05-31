/**
 * /admin — redirects to the social media portal dashboard.
 * This keeps the URL clean while ensuring /admin always goes somewhere useful.
 */

import { redirect } from 'next/navigation';

export default function AdminRootPage() {
  redirect('/admin/social-media');
}
