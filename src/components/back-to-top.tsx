'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Button
      size="icon"
      className={cn(
        'fixed bottom-4 right-4 z-50 rounded-full transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
      onClick={scrollToTop}
      aria-label="Go to top"
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
    >
      <ArrowUp />
    </Button>
  );
}
