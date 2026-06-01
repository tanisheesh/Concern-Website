import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateContent, type GenerateContentInput } from '@/lib/ai';
import { rateLimit } from '@/lib/rate-limit';

// Patterns that indicate the input is code / credentials / non-event content
const CODE_PATTERNS = [
  /require\s*\(/i,
  /import\s+\w+/i,
  /admin\.initializeApp/i,
  /serviceAccount/i,
  /firebase-admin/i,
  /credential\.cert/i,
  /path\/to\//i,
  /BEGIN PRIVATE KEY/i,
  /BEGIN RSA/i,
  /function\s*\w*\s*\(/,
  /(var|const|let)\s+\w+\s*=/,
  /<\?php/i,
  /SELECT\s+\*\s+FROM/i,
  /DROP\s+TABLE/i,
  /"type"\s*:\s*"service_account"/i,
  /-----BEGIN/,
  /client_email/i,
  /private_key_id/i,
];

function looksLikeCode(text: string): boolean {
  return CODE_PATTERNS.some((p) => p.test(text));
}

// Replace underscores with spaces and collapse whitespace so poorly
// formatted input like "Unique_Art_Therapy_for_codependents" doesn't leak
// raw slug text into the generated content.
function sanitiseText(raw: string): string {
  return raw.replace(/_/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const userId = session.user.id ?? 'unknown';
  if (!rateLimit(`ai:${userId}`, 10, 60_000)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': '60' } },
    );
  }

  let input: GenerateContentInput;
  try {
    input = await req.json() as GenerateContentInput;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const title       = sanitiseText(input.title       ?? '');
  const description = sanitiseText(input.description ?? '');
  const location    = input.location ? sanitiseText(input.location) : input.location;

  if (!title || !description) {
    return NextResponse.json({ error: 'Title and description are required.' }, { status: 400 });
  }

  // Block code / credentials / non-event content
  if (looksLikeCode(title) || looksLikeCode(description)) {
    return NextResponse.json(
      { error: 'Please describe a real CONCERN NGO event or activity.' },
      { status: 422 },
    );
  }

  // Basic sanity: title should be at least 5 chars, description at least 20
  if (title.length < 5 || description.length < 20) {
    return NextResponse.json(
      { error: 'Please provide more detail about the event.' },
      { status: 422 },
    );
  }

  try {
    const content = await generateContent({ ...input, title, description, location });
    return NextResponse.json(content);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI generation failed.';
    console.error('[generate]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
