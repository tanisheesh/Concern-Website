import type { Metadata } from 'next';
import ComingSoon from '@/components/admin/coming-soon';

export const metadata: Metadata = { title: 'Scheduled Posts' };

export default function SchedulePage() {
  return (
    <ComingSoon
      title="Scheduled Posts"
      description="View and manage posts that are queued for future publishing."
      phase="Phase 6"
    />
  );
}
