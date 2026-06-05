/**
 * Extracts text from Annual Report & ITR PDFs stored in Google Drive.
 * Saves output to src/data/pdf-data.json for use by the chatbot at runtime.
 *
 * Usage (local):  node --env-file=.env.local scripts/extract-pdfs.mjs
 * Usage (CI):     set GOOGLE_* env vars via secrets, then: node scripts/extract-pdfs.mjs
 */

import { google } from 'googleapis';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { PDFParse } from 'pdf-parse';
import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, '../src/data/pdf-data.json');

// --- Google Auth ---

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

const drive = google.drive({ version: 'v3', auth });

// --- Vision API OCR ---

let visionClient = null;
function getVisionClient() {
  if (!visionClient) {
    visionClient = new ImageAnnotatorClient({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
    });
  }
  return visionClient;
}

async function ocrPDF(buffer, pageCount) {
  const client = getVisionClient();
  const content = buffer.toString('base64');
  const texts = [];

  for (let start = 1; start <= pageCount; start += 5) {
    const pages = [];
    for (let p = start; p < start + 5 && p <= pageCount; p++) pages.push(p);

    const [result] = await client.batchAnnotateFiles({
      requests: [{
        inputConfig: { mimeType: 'application/pdf', content },
        features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
        pages,
      }],
    });

    for (const fileResponse of result.responses ?? []) {
      for (const pageResponse of fileResponse.responses ?? []) {
        const text = pageResponse.fullTextAnnotation?.text;
        if (text) texts.push(text);
      }
    }
  }

  return texts.join('\n');
}

// --- Drive helpers ---

async function getFolderIdByName(parentId, name) {
  const res = await drive.files.list({
    q: `'${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false`,
    fields: 'files(id)',
    pageSize: 1,
  });
  return res.data.files?.[0]?.id ?? null;
}

async function listPDFs(folderId) {
  const res = await drive.files.list({
    q: `'${folderId}' in parents and mimeType='application/pdf' and trashed=false`,
    fields: 'files(id, name)',
    pageSize: 100,
  });
  return (res.data.files ?? []).map(f => ({ id: f.id, name: f.name }));
}

async function downloadAndParse(fileId, fileName) {
  console.log(`  Downloading ${fileName} (no timeout)...`);
  const res = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'arraybuffer' }
  );
  const buffer = Buffer.from(res.data);
  console.log(`  Downloaded — ${(buffer.length / 1024 / 1024).toFixed(1)} MB`);

  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();

  const stripped = result.text.replace(/--\s*\d+\s*of\s*\d+\s*--/g, '').replace(/\s+/g, ' ').trim();
  if (stripped.length > 200) {
    console.log(`  "${fileName}" — ${result.text.length} chars (text layer)`);
    return result.text;
  }

  console.log(`  "${fileName}" is scanned — running OCR on ${result.total} pages...`);
  const ocrText = await ocrPDF(buffer, result.total);
  console.log(`  "${fileName}" OCR done — ${ocrText.length} chars`);
  return ocrText;
}

// --- Main ---

async function main() {
  const rootId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!rootId) throw new Error('GOOGLE_DRIVE_FOLDER_ID not set');

  console.log('Finding "Annual Reports and ITR" folder...');
  const itrFolderId = await getFolderIdByName(rootId, 'Annual Reports and ITR');
  if (!itrFolderId) throw new Error('"Annual Reports and ITR" folder not found in Drive');

  const [arFolderId, itrSubFolderId] = await Promise.all([
    getFolderIdByName(itrFolderId, 'Annual Reports'),
    getFolderIdByName(itrFolderId, 'Income Tax Returns'),
  ]);

  const subfolders = [
    { id: arFolderId, label: 'Annual Reports' },
    { id: itrSubFolderId, label: 'Income Tax Returns' },
  ];

  const entries = [];

  for (const { id, label } of subfolders) {
    if (!id) { console.warn(`Subfolder "${label}" not found, skipping`); continue; }
    const files = await listPDFs(id);
    console.log(`\n[${label}] — ${files.length} PDFs found`);

    for (const file of files) {
      try {
        const text = await downloadAndParse(file.id, file.name);
        entries.push({ fileName: file.name, folder: label, text });
      } catch (err) {
        console.error(`  FAILED: ${file.name} —`, err.message);
      }
    }
  }

  const output = { extractedAt: new Date().toISOString(), entries };
  mkdirSync(resolve(__dirname, '../src/data'), { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\nDone. ${entries.length} PDFs saved to src/data/pdf-data.json`);
}

main().catch(err => { console.error(err); process.exit(1); });
