import type { Metadata } from 'next';
import ComingSoon from '@/components/admin/coming-soon';

export const metadata: Metadata = { title: 'Knowledge Base' };

export default function KnowledgeBasePage() {
  return (
    <ComingSoon
      title="Knowledge Base"
      description="Upload reference documents — brochures, mission statements, and past content — to guide AI generation."
      phase="Phase 4"
    />
  );
}
