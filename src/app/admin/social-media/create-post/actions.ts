'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';

const saveDraftSchema = z.object({
  title:            z.string().min(1, 'Title is required').max(200),
  eventDescription: z.string().max(5000).default(''),
  eventDate:        z.string().optional(),
  location:         z.string().max(200).optional(),
  category:         z.string().default('Other'),
  generatedContent: z.string().default('{}'),   // JSON string
  platforms:        z.string().default('[]'),   // JSON array string
});

export async function saveDraft(formData: FormData): Promise<{ error: string } | never> {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthenticated' };

  const raw = Object.fromEntries(formData.entries());
  const parsed = saveDraftSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid data' };
  }

  const d = parsed.data;
  const db = getDb();

  const sql = [
    'INSERT INTO posts',
    '  (title, event_description, generated_content, platforms, status, created_by)',
    'VALUES (?, ?, ?, ?, ?, ?)',
  ].join(' ');

  db.prepare(sql).run(
    d.title,
    d.eventDescription,
    d.generatedContent,
    d.platforms,
    'draft',
    Number(session.user.id),
  );

  redirect('/admin/social-media/history');
}
