import type { Metadata } from 'next';
import { getDb } from '@/lib/db';
import HistoryClient from './history-client';

export const metadata: Metadata = { title: 'Post History' };
export const dynamic = 'force-dynamic';

interface PostRow {
  id: number;
  title: string;
  status: string;
  platforms: string;
  created_at: string;
  generated_content: string | null;
}

export default async function HistoryPage() {
  const db = getDb();
  const rows = db.prepare(`
    SELECT id, title, status, platforms, created_at, generated_content
    FROM posts
    ORDER BY created_at DESC
  `).all() as PostRow[];

  const posts = rows.map((r) => ({
    id:               r.id,
    title:            r.title,
    status:           r.status,
    platforms:        (() => { try { return JSON.parse(r.platforms) as string[]; } catch { return []; } })(),
    createdAt:        r.created_at,
    generatedContent: r.generated_content,
  }));

  return <HistoryClient posts={posts} />;
}
