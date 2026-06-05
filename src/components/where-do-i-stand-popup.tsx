'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ClipboardList } from 'lucide-react';

export function WhereDoIStandPopup() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem('wdis-seen')) return;
    const timer = setTimeout(() => setOpen(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    localStorage.setItem('wdis-seen', '1');
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) dismiss(); }}>
      <DialogContent className="max-w-md text-center">
        <DialogHeader className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <ClipboardList className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle className="text-xl font-bold text-primary">
            Want to know where you stand?
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Take our quick self-assessment to understand your relationship with
            alcohol and get a clearer picture of where you are today.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={() => {
              dismiss();
              router.push('/assessments');
            }}
          >
            Yes, Check Now
          </Button>
          <Button variant="outline" onClick={dismiss}>
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
