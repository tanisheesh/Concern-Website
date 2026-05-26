import { NextRequest, NextResponse } from 'next/server';
import type { Readable } from 'stream';
import { drive, withTimeout } from '@/lib/google-auth';
import { rateLimit } from '@/lib/rate-limit';

function nodeToWebStream(readable: Readable): ReadableStream {
  return new ReadableStream({
    start(controller) {
      readable.on('data', (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)));
      readable.on('end', () => controller.close());
      readable.on('error', (err: Error) => controller.error(err));
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return new NextResponse('Video ID is required', { status: 400 });

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!rateLimit(ip, 20, 60_000)) {
    return new NextResponse('Too many requests', { status: 429 });
  }

  try {
    const meta = await withTimeout(drive.files.get({ fileId: id, fields: 'mimeType, name, size' }));
    const { mimeType, name: fileName, size: fileSize } = meta.data;

    if (!mimeType?.startsWith('video/')) {
      return new NextResponse('File is not a video', { status: 400 });
    }

    const range = request.headers.get('range');

    if (range && fileSize) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : parseInt(fileSize) - 1;

      if (isNaN(start) || isNaN(end) || start < 0 || start > end || end >= parseInt(fileSize)) {
        return new NextResponse('Invalid range', { status: 416 });
      }

      const stream = await withTimeout(
        drive.files.get(
          { fileId: id, alt: 'media' },
          { responseType: 'stream', headers: { Range: `bytes=${start}-${end}` } }
        )
      );

      return new NextResponse(nodeToWebStream(stream.data as Readable), {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': String(end - start + 1),
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    const stream = await withTimeout(
      drive.files.get({ fileId: id, alt: 'media' }, { responseType: 'stream' })
    );

    const headers = new Headers({
      'Content-Type': mimeType,
      'Content-Disposition': `inline; filename="${fileName}"`,
      'Cache-Control': 'public, max-age=3600',
      'Accept-Ranges': 'bytes',
    });
    if (fileSize) headers.set('Content-Length', fileSize);

    return new NextResponse(nodeToWebStream(stream.data as Readable), { headers });
  } catch (error) {
    console.error('Error serving video:', error);
    return new NextResponse('Failed to load video', { status: 500 });
  }
}
