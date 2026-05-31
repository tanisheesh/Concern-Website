import type { Metadata } from 'next';
import { getDb } from '@/lib/db';
import type { MediaItem } from '@/types/admin';
import MediaLibraryClient from './media-library-client';

export const metadata: Metadata = { title: 'Media Library' };

// Force dynamic so search params are always fresh
export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Row type returned by SQLite (snake_case)
// ---------------------------------------------------------------------------
interface MediaRow {
  id: number;
  file_name: string;
  original_file_name: string;
  drive_file_id: string | null;
  public_url: string;
  mime_type: string;
  media_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  duration: number | null;
  event_name: string;
  description: string;
  event_date: string | null;
  location: string | null;
  category: string;
  beneficiaries_count: number | null;
  volunteer_count: number | null;
  tags: string;
  uploaded_by: number;
  uploaded_at: string;
  updated_at: string | null;
}

function rowToItem(r: MediaRow): MediaItem {
  return {
    id:                 r.id,
    fileName:           r.file_name,
    originalFileName:   r.original_file_name,
    driveFileId:        r.drive_file_id ?? undefined,
    publicUrl:          r.public_url,
    mimeType:           r.mime_type,
    mediaType:          r.media_type as MediaItem['mediaType'],
    fileSize:           r.file_size,
    width:              r.width ?? undefined,
    height:             r.height ?? undefined,
    duration:           r.duration ?? undefined,
    eventName:          r.event_name,
    description:        r.description,
    eventDate:          r.event_date ?? undefined,
    location:           r.location ?? undefined,
    category:           r.category as MediaItem['category'],
    beneficiariesCount: r.beneficiaries_count ?? undefined,
    volunteerCount:     r.volunteer_count ?? undefined,
    tags:               r.tags,
    uploadedBy:         r.uploaded_by,
    uploadedAt:         r.uploaded_at,
    updatedAt:          r.updated_at ?? undefined,
  };
}

export default function MediaLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  // Resolve searchParams synchronously via React's use() isn't needed here —
  // we read them in the server component directly after awaiting.
  return <MediaLibraryLoader searchParams={searchParams} />;
}

async function MediaLibraryLoader({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const q        = (params.q        ?? '').trim();
  const category = (params.category ?? '').trim();

  const db = getDb();

  let sql = `
    SELECT * FROM media_library
    WHERE 1=1
  `;
  const bindings: (string | number)[] = [];

  if (q) {
    sql += ` AND (event_name LIKE ? OR description LIKE ?)`;
    bindings.push(`%${q}%`, `%${q}%`);
  }
  if (category) {
    sql += ` AND category = ?`;
    bindings.push(category);
  }

  sql += ` ORDER BY uploaded_at DESC`;

  const rows = db.prepare(sql).all(...bindings) as MediaRow[];
  const items = rows.map(rowToItem);

  return (
    <MediaLibraryClient
      items={items}
      initialQ={q}
      initialCategory={category}
    />
  );
}
