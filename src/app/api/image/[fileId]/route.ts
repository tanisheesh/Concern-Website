import { NextRequest, NextResponse } from 'next/server';
import type { Readable } from 'stream';
import { drive, withTimeout } from '@/lib/google-auth';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;

  if (!fileId || !/^[a-zA-Z0-9_-]+$/.test(fileId)) {
    return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!rateLimit(ip, 200, 60_000)) {
    return new NextResponse('Too many requests', { status: 429 });
  }

  try {
    const file = await withTimeout(drive.files.get({ fileId, fields: 'mimeType' }));

    const response = await withTimeout(
      drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' })
    );

    const chunks: Buffer[] = [];
    for await (const chunk of response.data as Readable) {
      chunks.push(Buffer.from(chunk as Buffer));
    }

    return new NextResponse(Buffer.concat(chunks), {
      headers: {
        'Content-Type': file.data.mimeType ?? 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
  }
}
