/**
 * Groq AI integration — server-side only.
 * Never import this in client components.
 *
 * Required env var: GROQ_API_KEY
 */

import type { MediaCategory } from '@/types/admin';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GenerateContentInput {
  title: string;
  description: string;
  eventDate?: string;
  location?: string;
  category: MediaCategory | string;
  contentType: 'pre_event' | 'post_event';
}

export interface GeneratedPlatformContent {
  instagram: { caption: string; hashtags: string[] };
  facebook:  { content: string };
  linkedin:  { content: string };
  whatsapp:  { message: string };
  twitter:   { content: string };
}

// ---------------------------------------------------------------------------
// Groq API call
// ---------------------------------------------------------------------------

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL        = 'llama-3.3-70b-versatile';

function buildPrompt(input: GenerateContentInput): string {
  const datePart     = input.eventDate ? `Event Date: ${input.eventDate}` : '';
  const locationPart = input.location  ? `Location: ${input.location}`   : '';
  const meta         = [datePart, locationPart].filter(Boolean).join('\n');

  const isPreEvent = input.contentType === 'pre_event';

  const contentTypeInstruction = isPreEvent
    ? `Content Type: PRE-EVENT (happening soon)
Goal: Invite people, promote the event, build excitement, encourage participation and attendance.
Tone: Anticipatory, inviting, motivating. Use forward-looking language ("Join us", "Be part of", "Don't miss").`
    : `Content Type: POST-EVENT (already happened)
Goal: Report impact, summarise what happened, thank participants and volunteers, describe outcomes and results.
Tone: Grateful, celebratory, impactful. Use past tense. Highlight numbers, beneficiaries, and real change achieved.`;

  const platformInstructions = isPreEvent ? `
  "instagram": {
    "caption": "<emotional, inviting caption — 150-220 chars, builds excitement, ends with a call to join/attend>",
    "hashtags": ["<tag1>", "<tag2>", "<tag3>", "<tag4>", "<tag5>"]
  },
  "facebook": {
    "content": "<warm invitation post — 200-350 chars, community-focused, includes event details and a CTA to attend>"
  },
  "linkedin": {
    "content": "<professional event announcement — 250-400 chars, NGO/CSR angle, invites partners and supporters>"
  },
  "whatsapp": {
    "message": "<concise, forwardable invite — 100-180 chars, plain text, no hashtags, easy to share with date/location>"
  },
  "twitter": {
    "content": "<punchy event promo tweet — max 240 chars, includes 2-3 hashtags inline, drives attendance>"
  }` : `
  "instagram": {
    "caption": "<emotional impact caption — 150-220 chars, highlights outcomes and thanks participants, ends with gratitude CTA>",
    "hashtags": ["<tag1>", "<tag2>", "<tag3>", "<tag4>", "<tag5>"]
  },
  "facebook": {
    "content": "<storytelling recap — 200-350 chars, describes what happened, thanks volunteers, shares impact numbers>"
  },
  "linkedin": {
    "content": "<professional impact report — 250-400 chars, CSR-focused, highlights outcomes for donors and partners>"
  },
  "whatsapp": {
    "message": "<concise thank-you message — 100-180 chars, plain text, no hashtags, shareable summary of outcomes>"
  },
  "twitter": {
    "content": "<impactful recap tweet — max 240 chars, includes 2-3 hashtags inline, celebrates the achievement>"
  }`;

  return `You are a social media content writer for CONCERN, a Chennai-based NGO specialising in addiction rehabilitation and community welfare.

CONCERN's mission: Identify, Explore and Guide to Change. Values: Transparency, Empathy, Learning, Belongingness.

${contentTypeInstruction}

Generate platform-specific social media content for the following event/activity:

Title: ${input.title}
Category: ${input.category}
Description: ${input.description}
${meta}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{${platformInstructions}
}

Rules:
- Do NOT use generic phrases like "We are pleased to announce" or "It is with great pleasure"
- Focus on human impact, beneficiaries, and real change
- Keep CONCERN's voice: compassionate, direct, hopeful
- Hashtags must be relevant to addiction recovery, NGO work, and the specific category
- Always include #CONCERN and #ConcernRehab in Instagram hashtags`;
}

export async function generateContent(
  input: GenerateContentInput
): Promise<GeneratedPlatformContent> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured. Add it to your .env.local file.');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'user', content: buildPrompt(input) },
      ],
      temperature: 0.75,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    if (response.status === 429) {
      throw new Error('Groq rate limit reached. Please wait a moment and try again.');
    }
    if (response.status === 401) {
      throw new Error('Invalid GROQ_API_KEY. Check your environment configuration.');
    }
    throw new Error(`Groq API error ${response.status}: ${body.slice(0, 200)}`);
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };

  const raw = data.choices[0]?.message?.content;
  if (!raw) throw new Error('Groq returned an empty response.');

  try {
    const parsed = JSON.parse(raw) as GeneratedPlatformContent;
    if (!parsed.instagram || !parsed.facebook || !parsed.linkedin || !parsed.whatsapp || !parsed.twitter) {
      throw new Error('Incomplete response structure from AI.');
    }
    // Enforce 5-hashtag maximum
    parsed.instagram.hashtags = parsed.instagram.hashtags.slice(0, 5);
    return parsed;
  } catch {
    throw new Error('Failed to parse AI response. Please try again.');
  }
}
