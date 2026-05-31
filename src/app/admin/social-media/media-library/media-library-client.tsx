'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Plus, Search, Pencil, Trash2, Eye, Loader2, ImageIcon, Filter, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
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
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import MediaForm, { CATEGORIES } from '@/components/admin/media-form';
import { deleteMediaItem } from './actions';
import type { MediaItem } from '@/types/admin';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  items: MediaItem[];
  initialQ: string;
  initialCategory: string;
}

// ---------------------------------------------------------------------------
// View dialog
// ---------------------------------------------------------------------------

function ViewDialog({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  const tags: string[] = (() => {
    try { return JSON.parse(item.tags); } catch { return []; }
  })();

  const field = (label: string, value: string | number | undefined | null) =>
    value !== undefined && value !== null && value !== '' ? (
      <div key={label}>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-sm text-foreground mt-0.5">{value}</p>
      </div>
    ) : null;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary">{item.eventName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <Badge variant="secondary">{item.category}</Badge>
          {field('Description', item.description)}
          {field('Event Date', item.eventDate ? new Date(item.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : undefined)}
          {field('Location', item.location)}
          {field('Beneficiaries', item.beneficiariesCount)}
          {field('Volunteers', item.volunteerCount)}
          {tags.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tags</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {tags.map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
              </div>
            </div>
          )}
          <Separator />
          <p className="text-xs text-muted-foreground">
            Added {new Date(item.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            {item.updatedAt && ` · Updated ${new Date(item.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main client component
// ---------------------------------------------------------------------------

export default function MediaLibraryClient({ items, initialQ, initialCategory }: Props) {
  const router   = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  // Search / filter state (controlled, synced to URL)
  const [q,        setQ]        = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);

  // Dialog state
  const [formOpen,    setFormOpen]    = useState(false);
  const [editItem,    setEditItem]    = useState<MediaItem | null>(null);
  const [viewItem,    setViewItem]    = useState<MediaItem | null>(null);
  const [deleteId,    setDeleteId]    = useState<number | null>(null);
  const [isDeleting,  startDelete]    = useTransition();

  // Push search params to URL so server re-fetches
  const applyFilters = useCallback((newQ: string, newCat: string) => {
    const params = new URLSearchParams();
    if (newQ)    params.set('q', newQ);
    if (newCat)  params.set('category', newCat);
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname]);

  const handleSearch = (value: string) => {
    setQ(value);
    applyFilters(value, category);
  };

  const handleCategory = (value: string) => {
    const cat = value === 'all' ? '' : value;
    setCategory(cat);
    applyFilters(q, cat);
  };

  const clearFilters = () => {
    setQ('');
    setCategory('');
    router.push(pathname);
  };

  const handleDelete = () => {
    if (deleteId === null) return;
    startDelete(async () => {
      const result = await deleteMediaItem(deleteId);
      setDeleteId(null);
      if (result.success) {
        toast({ title: 'Record deleted' });
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    });
  };

  const openCreate = () => { setEditItem(null); setFormOpen(true); };
  const openEdit   = (item: MediaItem) => { setEditItem(item); setFormOpen(true); };

  const hasFilters = q || category;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-primary md:text-3xl">Media Library</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            {items.length} record{items.length !== 1 ? 's' : ''}
            {hasFilters ? ' (filtered)' : ''}
          </p>
        </div>
        <Button onClick={openCreate} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Add Record
        </Button>
      </div>

      {/* Search + Filter bar */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by title or description…"
            value={q}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <Select value={category || 'all'} onValueChange={handleCategory}>
          <SelectTrigger className="w-52">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="icon" onClick={clearFilters} aria-label="Clear filters">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Table */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center gap-3">
          <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
          <div>
            <p className="font-medium text-foreground">
              {hasFilters ? 'No records match your search' : 'No media records yet'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {hasFilters ? 'Try adjusting your filters.' : 'Click "Add Record" to create the first entry.'}
            </p>
          </div>
          {!hasFilters && (
            <Button variant="outline" size="sm" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> Add Record
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/40">
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Date</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">Location</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">Tags</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const tags: string[] = (() => {
                  try { return JSON.parse(item.tags); } catch { return []; }
                })();
                return (
                  <TableRow key={item.id} className="hover:bg-secondary/20">
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {item.eventName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs whitespace-nowrap">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground whitespace-nowrap">
                      {item.eventDate
                        ? new Date(item.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {item.location ?? '—'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {tags.slice(0, 2).map((t) => (
                          <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                        ))}
                        {tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">+{tags.length - 2}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost" size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => setViewItem(item)}
                          aria-label="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => openEdit(item)}
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteId(item.id)}
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create / Edit form dialog */}
      <MediaForm
        open={formOpen}
        onOpenChange={setFormOpen}
        item={editItem}
      />

      {/* View dialog */}
      {viewItem && <ViewDialog item={viewItem} onClose={() => setViewItem(null)} />}

      {/* Delete confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the media record from the library.
              This action cannot be undone.
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
