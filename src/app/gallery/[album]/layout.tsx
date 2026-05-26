import type { Metadata } from 'next';
import { slugToTitle } from '@/lib/albums';

export async function generateMetadata(
  { params }: { params: Promise<{ album: string }> }
): Promise<Metadata> {
  const { album } = await params;
  const title = slugToTitle(album);
  return {
    title,
    description: `View photos and videos from ${title} — Concern NGO Gallery`,
  };
}

export default function AlbumLayout({ children }: { children: React.ReactNode }) {
  return children;
}
