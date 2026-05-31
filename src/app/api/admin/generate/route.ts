/**
 * POST /api/admin/generate
 * Server-side AI content generation endpoint.
 * The GROQ_API_KEY never leaves the server.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateContent, type GenerateContentInput } from '@/lib/ai';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  // Auth check
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  // Rate limit: 10 AI calls per minute per user
  const userId = session.user.id ?? 'unknown';
  if (!rateLimit(`ai:${userId}`, 10, 60_000)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment.' },
      { status: 429 }
    );
  }

  let input: GenerateContentInput;
  try {
    input = await req.json() as GenerateContentInput;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!input.title?.trim() || !input.description?.trim()) {
    return NextResponse.json(
      { error: 'Title and description are required.' },
      { status: 400 }
    );
  }

  try {
    const content = await generateContent(input);
    return NextResponse.json(content);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI generation failed.';
    console.error('[generate]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
