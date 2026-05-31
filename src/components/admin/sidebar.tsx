'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import Image from 'next/image';
import {
  LayoutDashboard,
  ImageIcon,
  PenSquare,
  CalendarClock,
  History,
  BarChart3,
  Link2,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { AdminSessionUser } from '@/types/admin';

// ---------------------------------------------------------------------------
// Navigation items
// ---------------------------------------------------------------------------

const BASE = '/admin/social-media';

const navItems = [
  {
    label: 'Dashboard',
    href: BASE,
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: 'Media Library',
    href: `${BASE}/media-library`,
    icon: ImageIcon,
  },
  {
    label: 'Create Post',
    href: `${BASE}/create-post`,
    icon: PenSquare,
  },
  {
    label: 'Scheduled Posts',
    href: `${BASE}/schedule`,
    icon: CalendarClock,
  },
  {
    label: 'History',
    href: `${BASE}/history`,
    icon: History,
  },
  {
    label: 'Analytics',
    href: `${BASE}/analytics`,
    icon: BarChart3,
  },
  {
    label: 'Connections',
    href: `${BASE}/connections`,
    icon: Link2,
  },
  {
    label: 'Knowledge Base',
    href: `${BASE}/knowledge-base`,
    icon: BookOpen,
  },
  {
    label: 'Settings',
    href: `${BASE}/settings`,
    icon: Settings,
  },
] as const;

// ---------------------------------------------------------------------------
// Shared nav link component
// ---------------------------------------------------------------------------

interface NavLinkProps {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  onClick?: () => void;
}

function NavLink({ href, label, icon: Icon, exact = false, onClick }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
      {isActive && <ChevronRight className="ml-auto h-3 w-3 opacity-60" />}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Sidebar content (shared between desktop and mobile)
// ---------------------------------------------------------------------------

interface SidebarContentProps {
  user: AdminSessionUser;
  onNavClick?: () => void;
}

function SidebarContent({ user, onNavClick }: SidebarContentProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/admin/login' });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-border/60">
        <Image
          src="/images/concern-logo.jpg"
          alt="CONCERN"
          width={140}
          height={35}
          className="h-auto w-32 object-contain"
        />
      </div>

      {/* Portal label */}
      <div className="px-4 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Social Media Portal
        </p>
      </div>

      <Separator className="mb-2" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <nav aria-label="Admin navigation" className="space-y-0.5 py-1">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              exact={'exact' in item ? item.exact : false}
              onClick={onNavClick}
            />
          ))}
        </nav>
      </ScrollArea>

      {/* User info + sign out */}
      <div className="border-t border-border/60 p-3 space-y-2">
        <div className="rounded-md bg-secondary/60 px-3 py-2">
          <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
          <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
          <span className="mt-1 inline-block rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary capitalize">
            {user.role.replace('_', ' ')}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main exported Sidebar component
// ---------------------------------------------------------------------------

interface AdminSidebarProps {
  user: AdminSessionUser;
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Desktop sidebar — fixed, always visible on lg+                      */}
      {/* ------------------------------------------------------------------ */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-60 lg:border-r lg:border-border/60 lg:bg-card lg:z-30">
        <SidebarContent user={user} />
      </aside>

      {/* ------------------------------------------------------------------ */}
      {/* Mobile — hamburger button + Sheet drawer                            */}
      {/* ------------------------------------------------------------------ */}
      <div className="lg:hidden">
        {/* Sticky top bar for mobile */}
        <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border/60 bg-card px-4 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Image
            src="/images/concern-logo.jpg"
            alt="CONCERN"
            width={120}
            height={30}
            className="h-auto w-28 object-contain"
          />
          <span className="text-xs text-muted-foreground ml-1">Admin</span>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            <SidebarContent
              user={user}
              onNavClick={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
