import type { Metadata } from 'next';
import ComingSoon from '@/components/admin/coming-soon';

export const metadata: Metadata = { title: 'Settings' };

export default function SettingsPage() {
  return (
    <ComingSoon
      title="Settings"
      description="Manage admin accounts, notification preferences, and portal configuration."
      phase="Phase 2"
    />
  );
}
