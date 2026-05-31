'use client';

import { useState, useTransition } from 'react';
import { Trash2, Eye, Loader2, FileText, Instagram, Facebook, Linkedin, MessageCircle, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { deletePost } from './actions';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Post {
  id: number;
  title: string;
  status: string;
  platforms: string[];
  createdAt: string;
  generatedContent: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_STYLES: Record<string, string> = {
  draft:               'bg-secondary text-secondary-foreground',
  scheduled:           'bg-blue-100 text-blue-700',
  published:           'bg-green-100 text-green-700',
  partially_published: 'bg-yellow-100 text-yellow-700',
  failed:              'bg-destructive/10 text-destructive',
  publishing:          'bg-orange-100 text-orange-700',
};

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  instagram: Instagram,
  facebook:  Facebook,
  linkedin:  Linkedin,
  whatsapp:  MessageCircle,
  twitter:   Twitter,
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: 'text-[#E4405F]',
  facebook:  'text-[#1877F2]',
  linkedin:  'text-[#0A66C2]',
  whatsapp:  'text-[#25D366]',
  twitter:   'text-foreground',
};

// ---------------------------------------------------------------------------
// View dialog
// ---------------------------------------------------------------------------

function ViewDialog({ post, onClose }: { post: Post; onClose: () => void }) {
  type ContentShape = {
    instagram?: { caption?: string; hashtags?: string[] };
    facebook?:  { content?: string };
    linkedin?:  { content?: string };
    whatsapp?:  { message?: string };
    twitter?:   { content?: string };
  };

  const content: ContentShape = (() => {
    try { return post.generatedContent ? JSON.parse(post.generatedContent) : {}; }
    catch { return {}; }
  })();

  const hasPlatform = (key: string) => key in content && content[key as keyof ContentShape];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary pr-6">{post.title}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={`text-xs capitalize ${STATUS_STYLES[post.status] ?? ''}`}>
            {post.status.replace('_', ' ')}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(post.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </span>
        </div>

        {!post.generatedContent || post.generatedContent === '{}' ? (
          <p className="text-sm text-muted-foreground italic py-4 text-center">
            No generated content saved with this draft.
          </p>
        ) : (
          <Tabs defaultValue={post.platforms[0] ?? 'instagram'} className="mt-2">
            <TabsList className="grid grid-cols-5 w-full">
              {(['instagram','facebook','linkedin','whatsapp','twitter'] as const).map((key) => {
                const Icon = PLATFORM_ICONS[key]!;
                return (
                  <TabsTrigger
                    key={key}
                    value={key}
                    disabled={!hasPlatform(key)}
                    className="flex flex-col gap-0.5 py-1.5 h-auto"
                  >
                    <Icon className={`h-4 w-4 ${PLATFORM_COLORS[key]}`} />
                    <span className="text-[10px] hidden sm:block capitalize">{key === 'twitter' ? 'X' : key}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="instagram" className="mt-3 space-y-2">
              <p className="text-sm whitespace-pre-wrap">{content.instagram?.caption ?? '—'}</p>
              {content.instagram?.hashtags?.length ? (
                <>
                  <Separator />
                  <div className="flex flex-wrap gap-1">
                    {content.instagram.hashtags.map((t) => (
                      <Badge key={t} variant="outline" className="text-xs">#{t}</Badge>
                    ))}
                  </div>
                </>
              ) : null}
            </TabsContent>
            <TabsContent value="facebook" className="mt-3">
              <p className="text-sm whitespace-pre-wrap">{content.facebook?.content ?? '—'}</p>
            </TabsContent>
            <TabsContent value="linkedin" className="mt-3">
              <p className="text-sm whitespace-pre-wrap">{content.linkedin?.content ?? '—'}</p>
            </TabsContent>
            <TabsContent value="whatsapp" className="mt-3">
              <p className="text-sm whitespace-pre-wrap">{content.whatsapp?.message ?? '—'}</p>
            </TabsContent>
            <TabsContent value="twitter" className="mt-3">
              <p className="text-sm whitespace-pre-wrap">{content.twitter?.content ?? '—'}</p>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function HistoryClient({ posts }: { posts: Post[] }) {
  const { toast } = useToast();
  const [viewPost,   setViewPost]   = useState<Post | null>(null);
  const [deleteId,   setDeleteId]   = useState<number | null>(null);
  const [isDeleting, startDelete]   = useTransition();

  const handleDelete = () => {
    if (deleteId === null) return;
    startDelete(async () => {
      const result = await deletePost(deleteId);
      setDeleteId(null);
      if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Post deleted' });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-primary md:text-3xl">Post History</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {posts.length} post{posts.length !== 1 ? 's' : ''} — newest first
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center gap-3">
          <FileText className="h-10 w-10 text-muted-foreground/40" />
          <div>
            <p className="font-medium text-foreground">No posts yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create a post and save it as a draft to see it here.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/40">
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Platforms</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Created</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id} className="hover:bg-secondary/20">
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {post.title}
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs capitalize ${STATUS_STYLES[post.status] ?? 'bg-secondary'}`}>
                      {post.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      {post.platforms.map((p) => {
                        const Icon = PLATFORM_ICONS[p];
                        return Icon
                          ? <Icon key={p} className={`h-4 w-4 ${PLATFORM_COLORS[p] ?? ''}`} />
                          : null;
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(post.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => setViewPost(post)}
                        aria-label="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteId(post.id)}
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {viewPost && <ViewDialog post={viewPost} onClose={() => setViewPost(null)} />}

      <AlertDialog open={deleteId !== null} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the post and its generated content. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
