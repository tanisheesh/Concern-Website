import { NextRequest } from 'next/server';
import Groq from 'groq-sdk';
import { rateLimit } from '@/lib/rate-limit';
import { WEBSITE_KNOWLEDGE_BASE } from '@/lib/knowledge-base';
import { getPDFContext, isCacheLoaded } from '@/lib/drive-pdf-cache';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  if (!rateLimit(ip, 20, 60_000)) {
    return Response.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { message, history } = body as { message?: unknown; history?: unknown };

  if (typeof message !== 'string' || message.trim().length === 0 || message.length > 500) {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  const safeHistory = (Array.isArray(history) ? history : [])
    .filter((m): m is { role: 'user' | 'assistant'; content: string } =>
      m && typeof m === 'object' &&
      (m.role === 'user' || m.role === 'assistant') &&
      typeof m.content === 'string'
    )
    .map(m => ({ role: m.role, content: m.content }))
    .slice(-10);

  const pdfContext = getPDFContext();
  const pdfSection = pdfContext
    ? `## ANNUAL REPORTS AND INCOME TAX RETURNS\n${pdfContext}`
    : isCacheLoaded()
      ? '## ANNUAL REPORTS AND INCOME TAX RETURNS\nNo documents found.'
      : '## ANNUAL REPORTS AND INCOME TAX RETURNS\nNote: Annual report documents are still loading. If asked about financial documents, apologize for the delay and suggest checking the Annual Reports page on the website.';

  const systemPrompt = `You are the official virtual assistant for CONCERN, an NGO addiction rehabilitation center in Chennai, India.

STRICT RULES — you must NEVER break these:
1. Topics you ARE allowed to answer: CONCERN's history, vision, mission, values, facilities, therapies (detoxification, psychotherapy, CBT, group therapy, individual/family/child counseling, transit), daily routine, team members, doctors, management committee, training programs, MoSJE NAPDDR scheme, IRCA, ODIC, CPLI, CONCERN Sanctuary, admissions/contact process, annual reports, income tax returns (ITR).
2. If a question is clearly unrelated to CONCERN or addiction rehabilitation (e.g. general knowledge, math, geography, writing poems/stories, coding), respond with exactly: "I can only help with questions about CONCERN. Is there something about our services, programs, or team I can help you with?"
3. If the answer is genuinely not found in the information provided below, respond with: "I don't have that specific information. Please contact CONCERN directly: 📞 +91 9840800816 | ✉ concernrehab@gmail.com"
4. Never invent or assume information. Only use what is provided below.
5. Be warm, empathetic, and professional. Many visitors may be reaching out during a difficult time for themselves or a family member.
6. Keep responses concise and readable. Use bullet points for lists. Aim for clarity over completeness.
7. For ITR / annual reports: ALWAYS state key figures — total income, filing date, form number, tax status, auditor name. Do NOT reproduce raw barcodes, IP addresses, verification hash strings, or legal boilerplate paragraphs.
8. After a summary, you may offer: "Would you like more details on any specific aspect?"

---

## WEBSITE INFORMATION
${WEBSITE_KNOWLEDGE_BASE}

---

${pdfSection}`;

  try {
    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...safeHistory,
        { role: 'user', content: message.trim() },
      ],
      stream: true,
      max_tokens: 1024,
      temperature: 0.3,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? '';
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
      cancel() {
        stream.controller.abort();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[Chat API] Groq error:', err);
    return Response.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
