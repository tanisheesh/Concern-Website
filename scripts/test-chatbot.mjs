/**
 * Chatbot test script — runs against the local dev server.
 * Usage: node scripts/test-chatbot.mjs
 * Make sure `npm run dev` is running first (port 9002).
 */

const BASE_URL = 'http://localhost:9002';

const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED    = '\x1b[31m';
const CYAN   = '\x1b[36m';
const DIM    = '\x1b[2m';

const testCases = [
  // ── Core info ──────────────────────────────────────────────────────────────
  { category: 'Core Info',    q: 'What is CONCERN?' },
  { category: 'Core Info',    q: 'What is the vision and mission of CONCERN?' },
  { category: 'Core Info',    q: 'Where is CONCERN located?' },
  { category: 'Core Info',    q: 'How can I contact CONCERN?' },

  // ── Services & Therapy ─────────────────────────────────────────────────────
  { category: 'Therapy',      q: 'What therapies does CONCERN offer?' },
  { category: 'Therapy',      q: 'What is the daily routine for patients?' },
  { category: 'Therapy',      q: 'How long does detoxification take?' },

  // ── Programs ───────────────────────────────────────────────────────────────
  { category: 'Programs',     q: 'What is the MoSJE NAPDDR scheme?' },
  { category: 'Programs',     q: 'What is CONCERN Sanctuary?' },
  { category: 'Programs',     q: 'Tell me about the training programs at CONCERN.' },

  // ── Team ───────────────────────────────────────────────────────────────────
  { category: 'Team',         q: 'Who is the founder of CONCERN?' },
  { category: 'Team',         q: 'Who are the doctors at CONCERN?' },

  // ── Financial documents ────────────────────────────────────────────────────
  { category: 'ITR/Finance',  q: 'Tell me about the ITR of 2024-25.' },
  { category: 'ITR/Finance',  q: 'What is the total income of CONCERN for 2024-25?' },
  { category: 'ITR/Finance',  q: 'Who is the auditor for CONCERN?' },

  // ── Out-of-scope (should be politely refused) ──────────────────────────────
  { category: 'Out-of-scope', q: 'What is the capital of France?' },
  { category: 'Out-of-scope', q: 'Write me a poem about the ocean.' },
  { category: 'Out-of-scope', q: 'What is 2 + 2?' },

  // ── Edge cases ─────────────────────────────────────────────────────────────
  { category: 'Edge',         q: 'asdfjkl;' },
  { category: 'Edge',         q: 'How do I get admitted to CONCERN?' },
];

async function askChatbot(message, history = []) {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status}: ${err}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
  }

  return text.trim();
}

function printDivider() {
  console.log(DIM + '─'.repeat(72) + RESET);
}

async function runTests() {
  console.log(`\n${BOLD}${CYAN}CONCERN Chatbot — Test Suite${RESET}`);
  console.log(`${DIM}Target: ${BASE_URL}/api/chat${RESET}`);
  printDivider();

  let passed = 0, failed = 0;
  let currentCategory = null;

  for (let i = 0; i < testCases.length; i++) {
    const { category, q } = testCases[i];

    if (category !== currentCategory) {
      currentCategory = category;
      console.log(`\n${BOLD}${YELLOW}[ ${category} ]${RESET}`);
    }

    process.stdout.write(`  ${DIM}${String(i + 1).padStart(2)}.${RESET} ${BOLD}${q}${RESET}\n`);
    process.stdout.write(`      ${DIM}→ ${RESET}`);

    try {
      const start = Date.now();
      const reply = await askChatbot(q);
      const ms = Date.now() - start;

      // Truncate long replies for display
      const preview = reply.length > 220
        ? reply.slice(0, 220).replace(/\n/g, ' ') + '…'
        : reply.replace(/\n/g, ' ');

      const timeLabel = ms > 5000
        ? `${RED}${(ms / 1000).toFixed(1)}s${RESET}`
        : `${GREEN}${(ms / 1000).toFixed(1)}s${RESET}`;

      console.log(`${preview}`);
      console.log(`      ${DIM}[${timeLabel}${DIM} · ${reply.length} chars]${RESET}`);
      passed++;
    } catch (err) {
      console.log(`${RED}ERROR: ${err.message}${RESET}`);
      failed++;
    }

    console.log();
  }

  printDivider();
  const total = passed + failed;
  const statusColor = failed === 0 ? GREEN : RED;
  console.log(`${BOLD}Results: ${statusColor}${passed}/${total} passed${RESET}${failed > 0 ? ` · ${RED}${failed} failed${RESET}` : ''}\n`);
}

runTests().catch(err => {
  console.error(`${RED}Fatal: ${err.message}${RESET}`);
  console.error(`${DIM}Is the dev server running? → npm run dev${RESET}`);
  process.exit(1);
});
