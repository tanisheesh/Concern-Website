'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Sparkles, Loader2, Save, Instagram, Facebook, Linkedin,
  MessageCircle, Twitter, AlertCircle,
} from 'lucide-react';
import { Button }     from '@/components/ui/button';
import { Input }      from '@/components/ui/input';
import { Textarea }   from '@/components/ui/textarea';
import { Label }      from '@/components/ui/label';
import { Badge }      from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { saveDraft } from './actions';
import type { GeneratedPlatformContent } from '@/lib/ai';
import type { MediaCategory } from '@/types/admin';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORIES: MediaCategory[] = [
  'Rehabilitation', 'Community Outreach', 'Awareness Programs',
  'Food Distribution', 'Events', 'Fundraising', 'Success Stories',
  'Volunteer Activities', 'Other',
];

const CONTENT_TYPES = [
  {
    value: 'pre_event' as const,
    label: 'Pre Event',
    description: 'Invite people, promote & build excitement',
  },
  {
    value: 'post_event' as const,
    label: 'Post Event',
    description: 'Report impact, thank participants & volunteers',
  },
];

// ---------------------------------------------------------------------------
// Form schema
// ---------------------------------------------------------------------------

const formSchema = z.object({
  title:            z.string().min(1, 'Title is required').max(200),
  eventDescription: z.string().min(1, 'Description is required').max(5000),
  eventDate:        z.string().optional(),
  location:         z.string().max(200).optional(),
  category:         z.string().default('Other'),
  contentType:      z.enum(['pre_event', 'post_event']).default('post_event'),
});
type FormValues = z.infer<typeof formSchema>;

// ---------------------------------------------------------------------------
// Platform tab config
// ---------------------------------------------------------------------------

const PLATFORMS = [
  { key: 'instagram' as const, label: 'Instagram', icon: Instagram,     color: 'text-[#E4405F]' },
  { key: 'facebook'  as const, label: 'Facebook',  icon: Facebook,      color: 'text-[#1877F2]' },
  { key: 'linkedin'  as const, label: 'LinkedIn',  icon: Linkedin,      color: 'text-[#0A66C2]' },
  { key: 'whatsapp'  as const, label: 'WhatsApp',  icon: MessageCircle, color: 'text-[#25D366]' },
  { key: 'twitter'   as const, label: 'X',         icon: Twitter,       color: 'text-foreground' },
];

// ---------------------------------------------------------------------------
// Editable content state
// ---------------------------------------------------------------------------

type EditableContent = {
  instagram: { caption: string; hashtags: string[] };
  facebook:  { content: string };
  linkedin:  { content: string };
  whatsapp:  { message: string };
  twitter:   { content: string };
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Normalise a tag: strip leading # and lowercase */
const normaliseTag = (t: string) => t.replace(/^#/, '').toLowerCase().trim();

/** Build the caption line from selected hashtags */
function buildHashtagLine(tags: string[]): string {
  return tags.map((t) => `#${normaliseTag(t)}`).join(' ');
}

/**
 * Replace the hashtag block at the end of a caption.
 * The block is everything after the last '\n\n' that starts with '#'.
 * If no block exists, append one.
 */
function syncCaptionHashtags(caption: string, tags: string[]): string {
  // Strip any existing hashtag block (two newlines + hashtags at end)
  const stripped = caption.replace(/\n\n#[\s\S]*$/, '').trimEnd();
  if (!tags.length) return stripped;
  return `${stripped}\n\n${buildHashtagLine(tags)}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CreatePostClient() {
  const { toast } = useToast();

  const [content,      setContent]     = useState<EditableContent | null>(null);
  const [genError,     setGenError]    = useState<string | null>(null);
  const [isGenerating, startGenerate]  = useTransition();
  const [isSaving,     startSave]      = useTransition();

  const { register, handleSubmit, getValues, setValue, formState: { errors } } =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useForm<FormValues>({ resolver: zodResolver(formSchema) as any });

  // -------------------------------------------------------------------------
  // Generate
  // -------------------------------------------------------------------------

  const onGenerate = handleSubmit((values) => {
    setGenError(null);
    startGenerate(async () => {
      try {
        const res = await fetch('/api/admin/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title:       values.title,
            description: values.eventDescription,
            eventDate:   values.eventDate,
            location:    values.location,
            category:    values.category,
            contentType: values.contentType,
          }),
        });

        const data = await res.json() as GeneratedPlatformContent & { error?: string };

        if (!res.ok) {
          setGenError(data.error ?? 'Generation failed. Please try again.');
          return;
        }

        // Instagram: keep caption clean; hashtags live in the array as "selected".
        // The caption textarea will show them appended via syncCaptionHashtags.
        const selectedTags = data.instagram.hashtags.map(normaliseTag);
        const cleanCaption = data.instagram.caption.replace(/\n\n#[\s\S]*$/, '').trimEnd();

        setContent({
          instagram: {
            caption:  syncCaptionHashtags(cleanCaption, selectedTags),
            hashtags: selectedTags,
          },
          facebook:  { content: data.facebook.content },
          linkedin:  { content: data.linkedin.content },
          whatsapp:  { message: data.whatsapp.message },
          twitter:   { content: data.twitter.content },
        });
      } catch {
        setGenError('Network error. Please check your connection and try again.');
      }
    });
  });

  // -------------------------------------------------------------------------
  // Instagram hashtag helpers
  // -------------------------------------------------------------------------

  /** Remove a selected hashtag chip — strips it from caption too */
  const removeHashtag = (tag: string) => {
    setContent((c) => {
      if (!c) return c;
      const updated = c.instagram.hashtags.filter((t) => t !== tag);
      return {
        ...c,
        instagram: {
          caption:  syncCaptionHashtags(c.instagram.caption, updated),
          hashtags: updated,
        },
      };
    });
  };

  /** Add a new hashtag to selected — appends to caption */
  const addHashtag = (raw: string) => {
    const tag = normaliseTag(raw);
    if (!tag) return;
    setContent((c) => {
      if (!c) return c;
      if (c.instagram.hashtags.includes(tag)) return c;
      const updated = [...c.instagram.hashtags, tag];
      return {
        ...c,
        instagram: {
          caption:  syncCaptionHashtags(c.instagram.caption, updated),
          hashtags: updated,
        },
      };
    });
  };

  // -------------------------------------------------------------------------
  // Save draft
  // -------------------------------------------------------------------------

  const onSaveDraft = () => {
    const values = getValues();
    if (!values.title?.trim()) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }

    startSave(async () => {
      const fd = new FormData();
      fd.set('title',            values.title);
      fd.set('eventDescription', values.eventDescription ?? '');
      fd.set('eventDate',        values.eventDate ?? '');
      fd.set('location',         values.location ?? '');
      fd.set('category',         values.category ?? 'Other');
      fd.set('generatedContent', content ? JSON.stringify(content) : '{}');
      fd.set('platforms',        JSON.stringify(PLATFORMS.map((p) => p.key)));

      const result = await saveDraft(fd);
      if (result?.error) {
        toast({ title: 'Error saving draft', description: result.error, variant: 'destructive' });
      }
    });
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-primary md:text-3xl">Create Post</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Fill in the event details, generate AI content, then save as draft.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={onSaveDraft}
          disabled={isSaving || isGenerating}
          className="shrink-0"
        >
          {isSaving
            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            : <Save className="mr-2 h-4 w-4" />}
          Save Draft
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ---------------------------------------------------------------- */}
        {/* LEFT — Event details form                                         */}
        {/* ---------------------------------------------------------------- */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Content Type */}
            <div className="space-y-1.5">
              <Label>Content Type <span className="text-destructive">*</span></Label>
              <div className="grid grid-cols-2 gap-2">
                {CONTENT_TYPES.map(({ value, label, description }) => (
                  <label
                    key={value}
                    className="relative flex flex-col gap-0.5 rounded-md border border-border p-3 cursor-pointer hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-colors"
                  >
                    <input
                      type="radio"
                      value={value}
                      className="sr-only"
                      {...register('contentType')}
                      defaultChecked={value === 'post_event'}
                    />
                    <span className="text-sm font-medium text-foreground">{label}</span>
                    <span className="text-xs text-muted-foreground leading-tight">{description}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                placeholder="e.g. Community Awareness Drive — Valasaravakkam"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label htmlFor="eventDescription">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="eventDescription"
                rows={4}
                placeholder="Describe the event, who was involved, what happened, and the impact…"
                {...register('eventDescription')}
              />
              {errors.eventDescription && (
                <p className="text-xs text-destructive">{errors.eventDescription.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-1">
              <Label>Category</Label>
              <Select defaultValue="Other" onValueChange={(v) => setValue('category', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date + Location */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="eventDate">Event Date</Label>
                <Input id="eventDate" type="date" {...register('eventDate')} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Chennai" {...register('location')} />
              </div>
            </div>

            <Separator />

            {/* Generate button */}
            <Button
              type="button"
              onClick={onGenerate}
              disabled={isGenerating}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isGenerating
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating…</>
                : <><Sparkles className="mr-2 h-4 w-4" />Generate AI Content</>}
            </Button>

            {genError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{genError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* ---------------------------------------------------------------- */}
        {/* RIGHT — Platform previews                                         */}
        {/* ---------------------------------------------------------------- */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Platform Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            {!content ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center gap-3 text-muted-foreground">
                <Sparkles className="h-10 w-10 opacity-20" />
                <p className="text-sm">
                  Fill in the event details and click<br />
                  <span className="font-medium text-foreground">Generate AI Content</span> to see previews.
                </p>
              </div>
            ) : (
              <Tabs defaultValue="instagram">
                <TabsList className="grid grid-cols-5 w-full mb-4">
                  {PLATFORMS.map(({ key, label, icon: Icon, color }) => (
                    <TabsTrigger key={key} value={key} className="flex flex-col gap-0.5 py-1.5 h-auto">
                      <Icon className={`h-4 w-4 ${color}`} />
                      <span className="text-[10px] hidden sm:block">{label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Instagram */}
                <TabsContent value="instagram" className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                      Caption
                    </Label>
                    <Textarea
                      rows={5}
                      value={content.instagram.caption}
                      onChange={(e) =>
                        setContent((c) => c
                          ? { ...c, instagram: { ...c.instagram, caption: e.target.value } }
                          : c)
                      }
                      className="text-sm resize-none"
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {content.instagram.caption.length} chars
                    </p>
                  </div>

                  {/* Selected hashtags — removable chips */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                      Selected Hashtags
                    </Label>
                    {content.instagram.hashtags.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No hashtags selected.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {content.instagram.hashtags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs gap-1 pr-1"
                          >
                            #{tag}
                            <button
                              type="button"
                              onClick={() => removeHashtag(tag)}
                              className="ml-0.5 rounded-full hover:bg-destructive/20 hover:text-destructive p-0.5 transition-colors"
                              aria-label={`Remove #${tag}`}
                            >
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                                <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                              </svg>
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add hashtag input */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                      Add Hashtag
                    </Label>
                    <Input
                      placeholder="Type a hashtag and press Enter"
                      className="text-xs h-8"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const el = e.target as HTMLInputElement;
                          addHashtag(el.value);
                          el.value = '';
                        }
                      }}
                    />
                  </div>
                </TabsContent>

                {/* Facebook */}
                <TabsContent value="facebook" className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Post Content</Label>
                  <Textarea
                    rows={7}
                    value={content.facebook.content}
                    onChange={(e) =>
                      setContent((c) => c ? { ...c, facebook: { content: e.target.value } } : c)
                    }
                    className="text-sm resize-none"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {content.facebook.content.length} chars
                  </p>
                </TabsContent>

                {/* LinkedIn */}
                <TabsContent value="linkedin" className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Post Content</Label>
                  <Textarea
                    rows={7}
                    value={content.linkedin.content}
                    onChange={(e) =>
                      setContent((c) => c ? { ...c, linkedin: { content: e.target.value } } : c)
                    }
                    className="text-sm resize-none"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {content.linkedin.content.length} chars
                  </p>
                </TabsContent>

                {/* WhatsApp */}
                <TabsContent value="whatsapp" className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Message</Label>
                  <Textarea
                    rows={5}
                    value={content.whatsapp.message}
                    onChange={(e) =>
                      setContent((c) => c ? { ...c, whatsapp: { message: e.target.value } } : c)
                    }
                    className="text-sm resize-none"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {content.whatsapp.message.length} chars
                  </p>
                </TabsContent>

                {/* Twitter / X */}
                <TabsContent value="twitter" className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Tweet</Label>
                  <Textarea
                    rows={4}
                    value={content.twitter.content}
                    onChange={(e) =>
                      setContent((c) => c ? { ...c, twitter: { content: e.target.value } } : c)
                    }
                    className="text-sm resize-none"
                  />
                  <p className={`text-xs text-right ${content.twitter.content.length > 280 ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                    {content.twitter.content.length} / 280
                  </p>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom save CTA */}
      {content && (
        <div className="flex justify-end">
          <Button onClick={onSaveDraft} disabled={isSaving} size="lg">
            {isSaving
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
              : <><Save className="mr-2 h-4 w-4" />Save as Draft</>}
          </Button>
        </div>
      )}
    </div>
  );
}
