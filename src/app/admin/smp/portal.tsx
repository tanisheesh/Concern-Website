'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { clientAuth } from '@/lib/firebase';
import {
  Sparkles, Loader2, Instagram, Facebook, Linkedin,
  MessageCircle, Twitter, AlertCircle, Copy, Check, LogOut, X, Lock,
} from 'lucide-react';
import Image from 'next/image';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import type { GeneratedPlatformContent } from '@/lib/ai';
import type { AdminSessionUser } from '@/types/admin';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PLATFORMS = [
  { key: 'instagram' as const, label: 'Instagram', short: 'IG', icon: Instagram,     color: '#E4405F', bg: '#FFF0F3' },
  { key: 'facebook'  as const, label: 'Facebook',  short: 'FB', icon: Facebook,      color: '#1877F2', bg: '#EEF4FF' },
  { key: 'linkedin'  as const, label: 'LinkedIn',  short: 'LI', icon: Linkedin,      color: '#0A66C2', bg: '#EEF4FF' },
  { key: 'whatsapp'  as const, label: 'WhatsApp',  short: 'WA', icon: MessageCircle, color: '#25D366', bg: '#F0FFF4' },
  { key: 'twitter'   as const, label: 'X',         short: 'X',  icon: Twitter,       color: '#000000', bg: '#F5F5F5' },
] as const;

type PlatformKey = typeof PLATFORMS[number]['key'];

// ---------------------------------------------------------------------------
// Form schema
// ---------------------------------------------------------------------------

const todayStr = () => new Date().toISOString().split('T')[0];

const formSchema = z.object({
  title:            z.string().min(1, 'Required').max(200),
  eventDescription: z.string().min(1, 'Required').max(5000),
  eventDate:        z.string().min(1, 'Date is required'),
  location:         z.string().max(200).optional(),
  contentType:      z.enum(['pre_event', 'post_event']).default('post_event'),
}).refine((data) => {
  if (data.contentType === 'post_event') return data.eventDate <= todayStr();
  return true;
}, {
  message: 'Post-event date cannot be in the future.',
  path: ['eventDate'],
}).refine((data) => {
  if (data.contentType === 'pre_event') return data.eventDate >= todayStr();
  return true;
}, {
  message: 'Pre-event date must be today or in the future.',
  path: ['eventDate'],
});

type FormValues = z.infer<typeof formSchema>;

// ---------------------------------------------------------------------------
// Content types
// ---------------------------------------------------------------------------

type EditableContent = {
  instagram: { caption: string; hashtags: string[] };
  facebook:  { content: string };
  linkedin:  { content: string };
  whatsapp:  { message: string };
  twitter:   { content: string };
};

const normaliseTag = (t: string) => t.replace(/^#/, '').toLowerCase().trim();

function syncHashtags(caption: string, tags: string[]): string {
  const stripped = caption.replace(/\n\n#[\s\S]*$/, '').trimEnd();
  if (!tags.length) return stripped;
  return `${stripped}\n\n${tags.map(t => `#${normaliseTag(t)}`).join(' ')}`;
}

// ---------------------------------------------------------------------------
// Small components
// ---------------------------------------------------------------------------

function CopyBtn({ text, disabled }: { text: string; disabled?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!text) return;
    try { await navigator.clipboard.writeText(text); } catch { return; }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  if (disabled) return null;
  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150',
        copied
          ? 'bg-green-50 text-green-600 border border-green-200'
          : 'bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary border border-transparent',
      )}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function CharCount({ current, max, warn = 0.85 }: { current: number; max: number; warn?: number }) {
  const pct = current / max;
  return (
    <span className={cn(
      'text-xs tabular-nums',
      pct >= 1 ? 'text-destructive font-semibold' :
      pct >= warn ? 'text-amber-500' :
      'text-muted-foreground',
    )}>
      {current}<span className="opacity-50">/{max}</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Portal component
// ---------------------------------------------------------------------------

export default function Portal({ user }: { user: AdminSessionUser }) {
  const router = useRouter();
  const { toast } = useToast();

  const [content,       setContent]      = useState<EditableContent | null>(null);
  const [activeTab,     setActiveTab]    = useState<PlatformKey>('instagram');
  const [genError,      setGenError]     = useState<string | null>(null);
  const [hashtagInput,  setHashtagInput] = useState('');
  const [isGenerating,  startGenerate]  = useTransition();
  const [isSigningOut,  startSignOut]   = useTransition();

  const { register, handleSubmit, watch, formState: { errors } } =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useForm<FormValues>({
      resolver:      zodResolver(formSchema) as any,
      defaultValues: { contentType: 'post_event' },
    });

  const contentType = watch('contentType', 'post_event');

  // ---------------------------------------------------------------------------
  // Sign out
  // ---------------------------------------------------------------------------

  const handleSignOut = () => {
    startSignOut(async () => {
      try { await firebaseSignOut(clientAuth); } catch { /* ignore */ }
      await fetch('/api/auth/session', { method: 'DELETE' });
      router.push('/admin/login');
    });
  };

  // ---------------------------------------------------------------------------
  // Generate
  // ---------------------------------------------------------------------------

  const onGenerate = handleSubmit((values) => {
    setGenError(null);
    startGenerate(async () => {
      try {
        const res = await fetch('/api/admin/generate', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title:       values.title,
            description: values.eventDescription,
            eventDate:   values.eventDate,
            location:    values.location,
            contentType: values.contentType,
          }),
        });
        const data = await res.json() as GeneratedPlatformContent & { error?: string };
        if (!res.ok) {
          setGenError(data.error ?? 'Generation failed. Please try again.');
          return;
        }
        const tags    = data.instagram.hashtags.map(normaliseTag);
        const caption = data.instagram.caption.replace(/\n\n#[\s\S]*$/, '').trimEnd();
        setContent({
          instagram: { caption: syncHashtags(caption, tags), hashtags: tags },
          facebook:  { content: data.facebook.content },
          linkedin:  { content: data.linkedin.content },
          whatsapp:  { message: data.whatsapp.message },
          twitter:   { content: data.twitter.content },
        });
        setActiveTab('instagram');
        toast({ title: '✓ Content ready', description: 'Review and copy from each platform.' });
      } catch {
        setGenError('Network error. Check your connection and try again.');
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Hashtag helpers
  // ---------------------------------------------------------------------------

  const removeHashtag = (tag: string, index: number) => {
    if (index === 0) return; // first tag is always locked
    setContent(c => {
      if (!c) return c;
      const updated = c.instagram.hashtags.filter((_, i) => i !== index);
      return { ...c, instagram: { caption: syncHashtags(c.instagram.caption, updated), hashtags: updated } };
    });
  };

  const addHashtag = (raw: string) => {
    const tag = normaliseTag(raw);
    if (!tag) return;
    setContent(c => {
      if (!c) return c;
      if (c.instagram.hashtags.length >= 5) return c;
      if (c.instagram.hashtags.includes(tag)) return c;
      const updated = [...c.instagram.hashtags, tag];
      return { ...c, instagram: { caption: syncHashtags(c.instagram.caption, updated), hashtags: updated } };
    });
  };

  // ---------------------------------------------------------------------------
  // Active platform data helper
  // ---------------------------------------------------------------------------

  const getContentText = (key: PlatformKey): string => {
    if (!content) return '';
    if (key === 'instagram') return content.instagram.caption;
    if (key === 'facebook')  return content.facebook.content;
    if (key === 'linkedin')  return content.linkedin.content;
    if (key === 'whatsapp')  return content.whatsapp.message;
    if (key === 'twitter')   return content.twitter.content;
    return '';
  };

  const setContentText = (key: PlatformKey, val: string) => {
    setContent(c => {
      if (!c) return c;
      if (key === 'instagram') return { ...c, instagram: { ...c.instagram, caption: val } };
      if (key === 'facebook')  return { ...c, facebook:  { content: val } };
      if (key === 'linkedin')  return { ...c, linkedin:  { content: val } };
      if (key === 'whatsapp')  return { ...c, whatsapp:  { message: val } };
      if (key === 'twitter')   return { ...c, twitter:   { content: val } };
      return c;
    });
  };

  const activePlatform = PLATFORMS.find(p => p.key === activeTab)!;
  const charLimit =
    activeTab === 'twitter'   ? 280  :
    activeTab === 'instagram' ? 2200 :
    activeTab === 'linkedin'  ? 3000 :
    activeTab === 'whatsapp'  ? 500  : 63206;
  const activeText    = getContentText(activeTab);
  const hashtagsFull  = (content?.instagram.hashtags.length ?? 0) >= 5;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/40 via-background to-background flex flex-col">

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-card/90 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/images/concern-logo.jpg" alt="CONCERN" width={120} height={30}
              className="w-28 object-contain" style={{ height: 'auto' }} priority />
            <span className="hidden sm:block text-xs font-medium text-muted-foreground border-l border-border/60 pl-3">
              Social Media Portal
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden md:block text-xs text-muted-foreground">{user.email}</span>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-all duration-150 disabled:opacity-50"
            >
              {isSigningOut
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <LogOut className="h-3.5 w-3.5" />}
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────── */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">

          {/* ── LEFT: Compose ────────────────────────────────────── */}
          <div className="flex flex-col gap-5">

            <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">

              <div className="px-5 pt-5 pb-4 border-b border-border/40">
                <h2 className="text-sm font-semibold text-foreground">Event Details</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Describe the event and generate platform content</p>
              </div>

              <div className="p-5 space-y-4">

                {/* Pre / Post toggle */}
                <div>
                  <p className="text-xs font-medium text-foreground mb-2">Content type</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(['pre_event', 'post_event'] as const).map((v) => {
                      const active = contentType === v;
                      return (
                        <label key={v} className={cn(
                          'relative flex flex-col gap-1 rounded-xl border p-3 cursor-pointer transition-all duration-150',
                          active
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border hover:border-primary/30 hover:bg-secondary/50',
                        )}>
                          <input
                            type="radio" value={v} className="sr-only"
                            {...register('contentType')}
                            defaultChecked={v === 'post_event'}
                          />
                          <span className={cn('text-sm font-semibold', active ? 'text-primary' : 'text-foreground')}>
                            {v === 'pre_event' ? '📣 Pre Event' : '🎉 Post Event'}
                          </span>
                          <span className="text-xs text-muted-foreground leading-tight">
                            {v === 'pre_event' ? 'Promote & invite' : 'Report & thank'}
                          </span>
                          {active && <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-primary" />}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="title" className="text-xs font-medium text-foreground">
                      Title <span className="text-destructive">*</span>
                    </label>
                    <CharCount current={watch('title')?.length ?? 0} max={200} />
                  </div>
                  <input
                    id="title"
                    type="text"
                    {...register('title')}
                    className={cn(
                      'w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none',
                      'transition-all duration-150 focus:border-primary focus:ring-2 focus:ring-primary/20',
                      errors.title ? 'border-destructive' : 'border-input',
                    )}
                  />
                  {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
                </div>

                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="desc" className="text-xs font-medium text-foreground">
                      Description <span className="text-destructive">*</span>
                    </label>
                    <CharCount current={watch('eventDescription')?.length ?? 0} max={5000} />
                  </div>
                  <textarea
                    id="desc"
                    rows={4}
                    {...register('eventDescription')}
                    className={cn(
                      'w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none resize-none',
                      'transition-all duration-150 focus:border-primary focus:ring-2 focus:ring-primary/20',
                      errors.eventDescription ? 'border-destructive' : 'border-input',
                    )}
                  />
                  {errors.eventDescription && <p className="mt-1 text-xs text-destructive">{errors.eventDescription.message}</p>}
                </div>

                {/* Date + Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="edate" className="text-xs font-medium text-foreground block mb-1.5">
                      Date of the Event <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="edate"
                      type="date"
                      min={contentType === 'pre_event'  ? todayStr() : undefined}
                      max={contentType === 'post_event' ? todayStr() : undefined}
                      {...register('eventDate')}
                      className={cn(
                        'w-full rounded-xl border bg-background px-3 py-2.5 text-sm text-foreground outline-none',
                        'transition-all duration-150 focus:border-primary focus:ring-2 focus:ring-primary/20',
                        errors.eventDate ? 'border-destructive' : 'border-input',
                      )}
                    />
                    {errors.eventDate && <p className="mt-1 text-xs text-destructive">{errors.eventDate.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="loc" className="text-xs font-medium text-foreground block mb-1.5">Location</label>
                    <input
                      id="loc"
                      {...register('location')}
                      className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-all duration-150 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Error */}
                {genError && (
                  <div className="flex items-start gap-2.5 rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3">
                    <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{genError}</p>
                  </div>
                )}

                {/* Generate button */}
                <button
                  type="button"
                  onClick={onGenerate}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary/90 hover:shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isGenerating ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Generating content…</>
                  ) : (
                    <><Sparkles className="h-4 w-4" />Generate AI Content</>
                  )}
                </button>

              </div>
            </div>
          </div>

          {/* ── RIGHT: Preview ───────────────────────────────────── */}
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden flex flex-col">

              <div className="px-5 pt-5 pb-4 border-b border-border/40">
                <h2 className="text-sm font-semibold text-foreground">Generated Content</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {content ? 'Review, edit, then copy for each platform' : 'Fill in the details and click Generate'}
                </p>
              </div>

              {/* Platform tab bar */}
              <div className="flex gap-1 px-4 pt-3 pb-0 border-b border-border/40 overflow-x-auto">
                {PLATFORMS.map(p => {
                  const active = activeTab === p.key;
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.key}
                      onClick={() => setActiveTab(p.key)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 transition-all duration-150 whitespace-nowrap',
                        active
                          ? 'border-b-2 text-foreground bg-background/60'
                          : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/40',
                      )}
                      style={active ? { borderBottomColor: p.color } : {}}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: p.color }} />
                      <span className="hidden sm:inline">{p.label}</span>
                      <span className="sm:hidden">{p.short}</span>
                    </button>
                  );
                })}
              </div>

              {/* Content area */}
              <div className="flex-1 p-5">
                {!content ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: activePlatform.bg }}>
                      <activePlatform.icon className="h-6 w-6" style={{ color: activePlatform.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">No content yet</p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                        Fill in the event details and click Generate
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Main content textarea */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {activeTab === 'instagram' ? 'Caption' : activeTab === 'whatsapp' ? 'Message' : activeTab === 'twitter' ? 'Tweet' : 'Post'}
                        </span>
                        <CopyBtn text={activeText} />
                      </div>
                      <textarea
                        rows={activeTab === 'twitter' ? 4 : activeTab === 'whatsapp' ? 5 : 7}
                        value={activeText}
                        onChange={e => setContentText(activeTab, e.target.value)}
                        className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm text-foreground outline-none resize-none transition-all duration-150 focus:border-primary focus:ring-2 focus:ring-primary/20 leading-relaxed"
                      />
                      <div className="flex items-center justify-end mt-1.5">
                        <CharCount current={activeText.length} max={charLimit} />
                      </div>
                    </div>

                    {/* Instagram hashtags */}
                    {activeTab === 'instagram' && content.instagram.hashtags.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Hashtags</p>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {content.instagram.hashtags.length}<span className="opacity-50">/5</span>
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {content.instagram.hashtags.map((tag, i) => (
                            <span key={tag}
                              className={cn(
                                'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium',
                                i === 0
                                  ? 'bg-primary/10 text-primary border border-primary/20'
                                  : 'bg-secondary text-foreground',
                              )}>
                              #{tag}
                              {i === 0 ? (
                                <Lock className="h-2.5 w-2.5 ml-0.5 opacity-50" />
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => removeHashtag(tag, i)}
                                  className="ml-0.5 text-muted-foreground hover:text-destructive transition-colors"
                                  aria-label={`Remove #${tag}`}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add hashtag (Instagram only) */}
                    {activeTab === 'instagram' && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Add hashtag</p>
                        <input
                          type="text"
                          value={hashtagInput}
                          onChange={e => setHashtagInput(e.target.value)}
                          disabled={hashtagsFull}
                          placeholder={hashtagsFull ? 'Max 5 hashtags reached' : ''}
                          className={cn(
                            'w-full rounded-xl border border-input bg-background px-3.5 py-2 text-xs text-foreground outline-none transition-all duration-150 focus:border-primary focus:ring-2 focus:ring-primary/20',
                            hashtagsFull && 'opacity-50 cursor-not-allowed',
                          )}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addHashtag(hashtagInput);
                              setHashtagInput('');
                            }
                          }}
                        />
                        {!hashtagsFull && (
                          <p className="text-xs text-muted-foreground/60 mt-1">Press Enter to add</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      <Toaster />
    </div>
  );
}
