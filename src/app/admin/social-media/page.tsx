/**
 * Social Media Portal — Dashboard
 *
 * Overview page showing quick stats and status of connected platforms.
 * Stats are placeholder values for now; they will be wired to real Firestore
 * data in later phases.
 */

import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import {
  ImageIcon,
  PenSquare,
  CalendarClock,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import type { AdminSessionUser } from '@/types/admin';

export const metadata: Metadata = {
  title: 'Dashboard',
};

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  href: string;
}

function StatCard({ title, value, description, icon: Icon, href }: StatCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        <Link
          href={href}
          className="mt-3 inline-flex items-center text-xs text-primary hover:underline font-medium"
        >
          View all <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Platform connection status
// ---------------------------------------------------------------------------

const platforms = [
  { name: 'Instagram', connected: false, color: 'text-[#E4405F]' },
  { name: 'Facebook', connected: false, color: 'text-[#1877F2]' },
  { name: 'LinkedIn', connected: false, color: 'text-[#0A66C2]' },
  { name: 'X (Twitter)', connected: false, color: 'text-foreground' },
] as const;

// ---------------------------------------------------------------------------
// Quick actions
// ---------------------------------------------------------------------------

const quickActions = [
  {
    label: 'Upload Media',
    description: 'Add photos or videos to your library',
    href: '/admin/social-media/media-library',
    icon: ImageIcon,
  },
  {
    label: 'Create Post',
    description: 'Generate and publish a new post',
    href: '/admin/social-media/create-post',
    icon: PenSquare,
  },
  {
    label: 'Schedule Post',
    description: 'Plan posts for future publishing',
    href: '/admin/social-media/schedule',
    icon: CalendarClock,
  },
] as const;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user as AdminSessionUser;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-primary md:text-3xl">
          {greeting()}, {user?.name?.split(' ')[0] ?? 'there'} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          Welcome to the CONCERN Social Media Management Portal.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Media Items"
          value="—"
          description="Images and videos in library"
          icon={ImageIcon}
          href="/admin/social-media/media-library"
        />
        <StatCard
          title="Posts Published"
          value="—"
          description="Total posts across all platforms"
          icon={CheckCircle2}
          href="/admin/social-media/history"
        />
        <StatCard
          title="Scheduled"
          value="—"
          description="Posts waiting to be published"
          icon={Clock}
          href="/admin/social-media/schedule"
        />
        <StatCard
          title="Drafts"
          value="—"
          description="Posts in progress"
          icon={AlertCircle}
          href="/admin/social-media/history"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Platform connections */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Platform Connections</CardTitle>
            <CardDescription>
              Status of connected social media accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {platforms.map((platform) => (
              <div key={platform.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {platform.connected ? (
                    <Wifi className={`h-4 w-4 ${platform.color}`} />
                  ) : (
                    <WifiOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">{platform.name}</span>
                </div>
                <Badge
                  variant={platform.connected ? 'default' : 'secondary'}
                  className={platform.connected ? 'bg-primary/10 text-primary border-primary/20' : ''}
                >
                  {platform.connected ? 'Connected' : 'Not connected'}
                </Badge>
              </div>
            ))}
            <Separator className="my-2" />
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/admin/social-media/connections">
                Manage Connections
                <ArrowRight className="ml-2 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 rounded-md border border-border/60 p-3 transition-colors hover:bg-secondary/50 hover:border-primary/30 group"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <action.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {action.label}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {action.description}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Setup notice */}
      <Card className="border-accent/40 bg-accent/5">
        <CardContent className="flex items-start gap-3 pt-4">
          <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">Setup Required</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Connect your social media accounts to start publishing. Visit the{' '}
              <Link href="/admin/social-media/connections" className="text-primary hover:underline font-medium">
                Connections
              </Link>{' '}
              page to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
