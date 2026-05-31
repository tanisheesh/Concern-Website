/**
 * Placeholder component for admin pages that are not yet implemented.
 * Used during the foundation phase so routing and navigation work end-to-end.
 */

import { Construction } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ComingSoonProps {
  title: string;
  description: string;
  phase?: string;
}

export default function ComingSoon({
  title,
  description,
  phase = 'Phase 2',
}: ComingSoonProps) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-primary md:text-3xl">{title}</h1>
        <p className="mt-1 text-muted-foreground">{description}</p>
      </div>

      <Card className="border-dashed border-2 border-border/60">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Construction className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-foreground">Coming Soon</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              This module is part of the implementation roadmap and will be
              available in an upcoming phase.
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            Planned for {phase}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
