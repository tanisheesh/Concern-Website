'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import type { MediaCategory } from '@/types/admin';

// ---------------------------------------------------------------------------
// Shared schema
// ---------------------------------------------------------------------------

const CATEGORIES: [MediaCategory, ...MediaCategory[]] = [
  'Rehabilitation', 'Community Outreach', 'Awareness Programs',
  'Food Distribution', 'Events', 'Fundraising', 'Success Stories',
  'Volunteer Activities', 'Other',
];

const mediaSchema = z.object({
  eventName:          z.string().min(1, 'Title is required').max(200),
  description:        z.string().max(2000).default(''),
  category:           z.enum(CATEGORIES),
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

type ActionResult = { success: true } | { success: false; error: string };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function tagsToJson(raw: string): string {
  const arr = raw.split(',').map((t) => t.trim()).filter(Boolean);
  return JSON.stringify(arr);
}

async function requireSession(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthenticated');
  return Number(session.user.id);
}

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------

export async function createMediaItem(formData: FormData): Promise<ActionResult> {
  try {
    const userId = await requireSession();
    const raw = Object.fromEntries(formData.entries());
    const parsed = mediaSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid data' };
    }
    const d = parsed.data;
    const db = getDb();

    const sql = [
      'INSERT INTO media_library',
      '  (file_name, original_file_name, public_url, mime_type, media_type,',
      '   file_size, event_name, description, event_date, location, category,',
      '   beneficiaries_count, volunteer_count, tags, uploaded_by)',
      'VALUES',
      "  ('placeholder','placeholder','','application/octet-stream','image',",
      '   0, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ].join(' ');

    db.prepare(sql).run(
      d.eventName,
      d.description,
      d.eventDate || null,
      d.location || null,
      d.category,
      d.beneficiariesCount ?? null,
      d.volunteerCount ?? null,
      tagsToJson(d.tags),
      userId,
    );

    revalidatePath('/admin/social-media/media-library');
    return { success: true };
  } catch (err) {
    console.error('[media] createMediaItem:', err);
    return { success: false, error: 'Failed to create record.' };
  }
}

// ---------------------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------------------

export async function updateMediaItem(id: number, formData: FormData): Promise<ActionResult> {
  try {
    await requireSession();
    const raw = Object.fromEntries(formData.entries());
    const parsed = mediaSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid data' };
    }
    const d = parsed.data;
    const db = getDb();

    const sql = [
      'UPDATE media_library SET',
      "  event_name          = ?,",
      "  description         = ?,",
      "  event_date          = ?,",
      "  location            = ?,",
      "  category            = ?,",
      "  beneficiaries_count = ?,",
      "  volunteer_count     = ?,",
      "  tags                = ?,",
      "  updated_at          = strftime('%Y-%m-%dT%H:%M:%fZ','now')",
      'WHERE id = ?',
    ].join(' ');

    const result = db.prepare(sql).run(
      d.eventName,
      d.description,
      d.eventDate || null,
      d.location || null,
      d.category,
      d.beneficiariesCount ?? null,
      d.volunteerCount ?? null,
      tagsToJson(d.tags),
      id,
    );

    if (result.changes === 0) return { success: false, error: 'Record not found.' };
    revalidatePath('/admin/social-media/media-library');
    return { success: true };
  } catch (err) {
    console.error('[media] updateMediaItem:', err);
    return { success: false, error: 'Failed to update record.' };
  }
}

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------

export async function deleteMediaItem(id: number): Promise<ActionResult> {
  try {
    await requireSession();
    const db = getDb();
    const result = db.prepare('DELETE FROM media_library WHERE id = ?').run(id);
    if (result.changes === 0) return { success: false, error: 'Record not found.' };
    revalidatePath('/admin/social-media/media-library');
    return { success: true };
  } catch (err) {
    console.error('[media] deleteMediaItem:', err);
    return { success: false, error: 'Failed to delete record.' };
  }
}
