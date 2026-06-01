'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function AnnualReportsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h2 className="mb-4 text-2xl font-bold text-primary">Failed to load documents</h2>
      <p className="mb-6 text-muted-foreground">
        Something went wrong while loading the reports. Please try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
