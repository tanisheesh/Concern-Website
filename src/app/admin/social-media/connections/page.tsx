import type { Metadata } from 'next';
import ComingSoon from '@/components/admin/coming-soon';

export const metadata: Metadata = { title: 'Platform Connections' };

export default function ConnectionsPage() {
  return (
    <ComingSoon
      title="Platform Connections"
      description="Connect and manage CONCERN's Instagram, Facebook, LinkedIn, and X accounts."
      phase="Phase 5"
    />
  );
}
