'use client';

import Link from 'next/link';
import { ClipboardList } from 'lucide-react';

export default function AssessmentButton() {
  return (
    <Link
      href="/assessments"
      aria-label="Take the self-assessment"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-3 rounded-full shadow-[0_4px_18px_rgba(0,0,0,0.20)] hover:shadow-[0_4px_22px_rgba(0,0,0,0.26)] hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all"
    >
      <ClipboardList className="h-5 w-5 shrink-0" />
      <span className="hidden sm:inline whitespace-nowrap">Where Do I Stand?</span>
    </Link>
  );
}
