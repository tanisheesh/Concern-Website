'use client';

import { useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { createMediaItem, updateMediaItem } from '@/app/admin/social-media/media-library/actions';
import type { MediaCategory, MediaItem } from '@/types/admin';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const CATEGORIES: MediaCategory[] = [
  'Rehabilitation', 'Community Outreach', 'Awareness Programs',
  'Food Distribution', 'Events', 'Fundraising', 'Success Stories',
  'Volunteer Activities', 'Other',
];

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const schema = z.object({
  eventName:          z.string().min(1, 'Title is required').max(200),
  description:        z.string().max(2000).default(''),
  category:           z.enum(CATEGORIES as [MediaCategory, ...MediaCategory[]]),
  eventDate:          z.string().optional(),
  location:           z.string().max(200).optional(),
  beneficiariesCount: z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? undefined : Number(v)),
    z.number().int().min(0).optional()
  ),
  volunteerCount: z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? undefined : Number(v)),
    z.number().int().min(0).optional()
  ),
  tags: z.string().default(''),
});

// Use z.output to get the post-transform type for the form
type FormValues = z.output<typeof schema>;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MediaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: MediaItem | null;   // null = create mode
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MediaForm({ open, onOpenChange, item }: MediaFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const isEdit = !!item;

  const { register, handleSubmit, reset, setValue, formState: { errors } } =
    useForm<FormValues>({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolver: zodResolver(schema) as any,
      defaultValues: {
        eventName: '',
        description: '',
        category: 'Other',
        eventDate: '',
        location: '',
        tags: '',
      },
    });

  // Populate form when editing
  useEffect(() => {
    if (open && item) {
      const tags = (() => {
        try { return (JSON.parse(item.tags) as string[]).join(', '); }
        catch { return ''; }
      })();
      reset({
        eventName:          item.eventName,
        description:        item.description,
        category:           item.category,
        eventDate:          item.eventDate?.slice(0, 10) ?? '',
        location:           item.location ?? '',
        beneficiariesCount: item.beneficiariesCount ?? ('' as unknown as number),
        volunteerCount:     item.volunteerCount ?? ('' as unknown as number),
        tags,
      });
    } else if (open && !item) {
      reset({
        eventName: '', description: '', category: 'Other',
        eventDate: '', location: '', tags: '',
      });
    }
  }, [open, item, reset]);

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const fd = new FormData();
      Object.entries(values).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') fd.append(k, String(v));
      });
      // ensure category always present
      fd.set('category', values.category);

      const result = isEdit
        ? await updateMediaItem(item!.id, fd)
        : await createMediaItem(fd);

      if (result.success) {
        toast({ title: isEdit ? 'Record updated' : 'Record created' });
        onOpenChange(false);
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Media Record' : 'Add Media Record'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])} className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1">
            <Label htmlFor="eventName">Title <span className="text-destructive">*</span></Label>
            <Input id="eventName" {...register('eventName')} placeholder="Event or media title" />
            {errors.eventName && <p className="text-xs text-destructive">{errors.eventName.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} rows={3} placeholder="Brief description of the event or media" />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <Label>Category <span className="text-destructive">*</span></Label>
            <Select
              defaultValue={item?.category ?? 'Other'}
              onValueChange={(v) => setValue('category', v as MediaCategory)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
          </div>

          {/* Event Date + Location */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="eventDate">Event Date</Label>
              <Input id="eventDate" type="date" {...register('eventDate')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register('location')} placeholder="City or venue" />
            </div>
          </div>

          {/* Beneficiaries + Volunteers */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="beneficiariesCount">Beneficiaries</Label>
              <Input id="beneficiariesCount" type="number" min={0} {...register('beneficiariesCount')} placeholder="0" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="volunteerCount">Volunteers</Label>
              <Input id="volunteerCount" type="number" min={0} {...register('volunteerCount')} placeholder="0" />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <Label htmlFor="tags">Tags</Label>
            <Input id="tags" {...register('tags')} placeholder="Comma-separated: awareness, youth, Chennai" />
            <p className="text-xs text-muted-foreground">Separate tags with commas</p>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Create Record'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
