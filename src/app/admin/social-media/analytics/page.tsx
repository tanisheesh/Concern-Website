import type { Metadata } from 'next';
import ComingSoon from '@/components/admin/coming-soon';

export const metadata: Metadata = { title: 'Analytics' };

export default function AnalyticsPage() {
  return (
    <ComingSoon
      title="Analytics"
      description="Track reach, engagement, and impact metrics across all connected platforms."
      phase="Phase 7"
    />
  );
}
