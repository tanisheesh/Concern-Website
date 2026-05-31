'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function deletePost(id: number): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: 'Unauthenticated' };

  const db = getDb();
  const result = db.prepare('DELETE FROM posts WHERE id = ?').run(id);
  if (result.changes === 0) return { error: 'Post not found.' };

  revalidatePath('/admin/social-media/history');
  return {};
}
