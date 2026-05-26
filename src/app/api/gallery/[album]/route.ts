import { NextRequest, NextResponse } from 'next/server';
import { drive_v3 } from 'googleapis';
import { drive, withTimeout } from '@/lib/google-auth';
import { slugToTitle } from '@/lib/albums';
import { rateLimit } from '@/lib/rate-limit';

const MAIN_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID!;

interface CacheEntry { id: string; expiresAt: number }
const folderIdCache = new Map<string, CacheEntry>();
const FOLDER_CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function getFolderId(folderName: string, parentId: string): Promise<string | null> {
  const key = `${parentId}-${folderName}`;
  const cached = folderIdCache.get(key);
  if (cached && Date.now() < cached.expiresAt) return cached.id;

  try {
    const res = await withTimeout(drive.files.list({
      q: `'${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
      fields: 'files(id)',
      pageSize: 1,
    }));
    const id = res.data.files?.[0]?.id;
    if (id) {
      if (folderIdCache.size >= 500) {
        const firstKey = folderIdCache.keys().next().value;
        if (firstKey) folderIdCache.delete(firstKey);
      }
      folderIdCache.set(key, { id, expiresAt: Date.now() + FOLDER_CACHE_TTL });
      return id;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching folder "${folderName}":`, error);
    return null;
  }
}

async function findAlbumFolderId(albumName: string, parentNames: string[]): Promise<string | null> {
  const galleryId = await getFolderId('Gallery', MAIN_FOLDER_ID);
  if (!galleryId) return null;
  for (const parentName of parentNames) {
    const parentId = await getFolderId(parentName, galleryId);
    if (parentId) {
      const albumId = await getFolderId(albumName, parentId);
      if (albumId) return albumId;
    }
  }
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ album: string }> }
) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!rateLimit(ip, 30, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { album: albumSlug } = await params;
  if (!albumSlug || !/^[a-z0-9-]+$/.test(albumSlug)) {
    return NextResponse.json({ error: 'Invalid album slug' }, { status: 400 });
  }

  const albumName = slugToTitle(albumSlug);

  try {
    let albumFolderId: string | null = null;

    if (albumSlug === 'video-clips') {
      const galleryId = await getFolderId('Gallery', MAIN_FOLDER_ID);
      if (galleryId) {
        const progId = await getFolderId('Programmes and Events', galleryId);
        if (progId) albumFolderId = await getFolderId('Videos', progId);
      }
    } else {
      albumFolderId = await findAlbumFolderId(albumName, ['Programmes and Events', 'By Year']);
    }

    if (!albumFolderId) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    }

    let media: { id: string; name: string; url: string; isVideo: boolean; mimeType: string }[] = [];
    let pageToken: string | undefined;

    do {
      const res = await withTimeout(drive.files.list({
        q: `'${albumFolderId}' in parents and (mimeType contains 'image/' or mimeType contains 'video/') and trashed=false`,
        fields: 'nextPageToken, files(id, name, mimeType)',
        pageSize: 1000,
        pageToken,
      }));

      const files: drive_v3.Schema$File[] = res.data.files ?? [];
      media = media.concat(files.map((f) => ({
        id: f.id!,
        name: f.name!,
        mimeType: f.mimeType!,
        isVideo: f.mimeType?.startsWith('video/') ?? false,
        url: f.mimeType?.startsWith('video/') ? `/api/video/${f.id}` : `/api/image/${f.id}`,
      })));

      pageToken = res.data.nextPageToken ?? undefined;
    } while (pageToken);

    return NextResponse.json(media, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (error) {
    console.error('Gallery API error:', error);
    return NextResponse.json({ error: 'Failed to fetch album' }, { status: 500 });
  }
}
