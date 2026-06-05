/**
 * Adds a single missing PDF to the existing pdf-data.json.
 * No timeout — waits as long as needed.
 *
 * Usage: node --env-file=.env.local scripts/fix-missing-pdf.mjs
 */

import { google } from 'googleapis';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { PDFParse } from 'pdf-parse';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const JSON_PATH = resolve(__dirname, '../src/data/pdf-data.json');

// --- Config: which file to fix ---
const TARGET_FOLDER_NAME = 'Annual Reports';
const TARGET_FILE_NAME   = '2025-2026.pdf';

// --- Auth ---

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});
const drive = google.drive({ version: 'v3', auth });

// --- Vision OCR ---

const visionClient = new ImageAnnotatorClient({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

async function ocrPDF(buffer, pageCount) {
  const content = buffer.toString('base64');
  const texts = [];
  for (let start = 1; start <= pageCount; start += 5) {
    const pages = [];
    for (let p = start; p < start + 5 && p <= pageCount; p++) pages.push(p);
    const [result] = await visionClient.batchAnnotateFiles({
      requests: [{ inputConfig: { mimeType: 'application/pdf', content }, features: [{ type: 'DOCUMENT_TEXT_DETECTION' }], pages }],
    });
    for (const fr of result.responses ?? [])
      for (const pr of fr.responses ?? [])
        if (pr.fullTextAnnotation?.text) texts.push(pr.fullTextAnnotation.text);
  }
  return texts.join('\n');
}

// --- Drive helpers ---

async function getFolderIdByName(parentId, name) {
  const res = await drive.files.list({
    q: `'${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false`,
    fields: 'files(id)', pageSize: 1,
  });
  return res.data.files?.[0]?.id ?? null;
}

async function findFile(folderId, name) {
  const res = await drive.files.list({
    q: `'${folderId}' in parents and name='${name}' and trashed=false`,
    fields: 'files(id, name)', pageSize: 1,
  });
  return res.data.files?.[0] ?? null;
}

// --- Main ---

async function main() {
  const rootId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!rootId) throw new Error('GOOGLE_DRIVE_FOLDER_ID not set');

  console.log('Finding folder...');
  const itrFolderId = await getFolderIdByName(rootId, 'Annual Reports and ITR');
  if (!itrFolderId) throw new Error('"Annual Reports and ITR" not found');

  const targetFolderId = await getFolderIdByName(itrFolderId, TARGET_FOLDER_NAME);
  if (!targetFolderId) throw new Error(`"${TARGET_FOLDER_NAME}" not found`);

  const file = await findFile(targetFolderId, TARGET_FILE_NAME);
  if (!file) throw new Error(`"${TARGET_FILE_NAME}" not found in Drive`);

  console.log(`Downloading ${file.name} (no timeout, please wait)...`);
  const res = await drive.files.get({ fileId: file.id, alt: 'media' }, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(res.data);
  console.log(`Downloaded — ${(buffer.length / 1024 / 1024).toFixed(1)} MB`);

  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();

  const stripped = result.text.replace(/--\s*\d+\s*of\s*\d+\s*--/g, '').replace(/\s+/g, ' ').trim();
  let text;
  if (stripped.length > 200) {
    console.log(`Text layer found — ${result.text.length} chars`);
    text = result.text;
  } else {
    console.log(`Scanned PDF — running OCR on ${result.total} pages...`);
    text = await ocrPDF(buffer, result.total);
    console.log(`OCR done — ${text.length} chars`);
  }

  const existing = JSON.parse(readFileSync(JSON_PATH, 'utf-8'));
  existing.entries = existing.entries.filter(
    e => !(e.fileName === TARGET_FILE_NAME && e.folder === TARGET_FOLDER_NAME)
  );
  existing.entries.push({ fileName: TARGET_FILE_NAME, folder: TARGET_FOLDER_NAME, text });
  existing.extractedAt = new Date().toISOString();

  writeFileSync(JSON_PATH, JSON.stringify(existing, null, 2), 'utf-8');
  console.log(`Done. Total entries in pdf-data.json: ${existing.entries.length}`);
}

main().catch(err => { console.error(err); process.exit(1); });
