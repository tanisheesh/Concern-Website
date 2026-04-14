
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Menu, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/our-team', label: 'Our Team' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/annual-reports-and-itr', label: 'Annual Reports & ITR' },
  { href: '/assessments', label: 'Assessments' },
  { href: '/therapy', label: 'Therapy' },
  { href: '/training', label: 'Training' },
  { href: '/mosje', label: 'MoSJE', highlight: true },
  { href: '/sanctuary', label: 'Sanctuary' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        {/* Desktop Navigation */}
        <div className="hidden flex-1 items-center justify-center gap-x-8 lg:flex">
          <div className="flex items-center gap-x-4 text-sm font-medium">
            {navLinks.map((link) => (
               <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-md transition-colors",
                  pathname === link.href
                    ? "bg-secondary text-primary font-semibold"
                    : link.highlight
                    ? "text-accent-foreground bg-accent/90 hover:bg-accent font-semibold"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-primary"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
           <Button asChild className="ml-8 bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/contact-us">
                <Send />
                Contact Us
            </Link>
            </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[80vw] flex flex-col">
                <SheetHeader className="mb-6 text-left border-b pb-4">
                  <SheetTitle>
                    Menu
                  </SheetTitle>
                  <SheetDescription>
                    Navigate through the website sections
                  </SheetDescription>
                </SheetHeader>
                <ScrollArea className="flex-grow">
                  <div className="flex flex-col gap-2 pr-4">
                    {navLinks.map((link) => (
                      <SheetClose asChild key={link.href}>
                        <Link
                          href={link.href}
                          className={cn(
                            "rounded-md px-4 py-3 text-base font-medium",
                            pathname === link.href
                              ? "bg-secondary text-primary"
                              : link.highlight
                              ? "text-accent-foreground bg-accent/90 hover:bg-accent"
                              : "text-muted-foreground hover:bg-secondary/50"
                          )}
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                </ScrollArea>
                 <SheetClose asChild>
                    <Button asChild className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
                        <Link href="/contact-us">
                            <Send />
                            Contact Us
                        </Link>
                    </Button>
                </SheetClose>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
