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
    const [file, response] = await Promise.all([
      withTimeout(drive.files.get({ fileId, fields: 'mimeType' })),
      withTimeout(drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' })),
    ]);

    return new NextResponse(nodeToWebStream(response.data as Readable), {
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
