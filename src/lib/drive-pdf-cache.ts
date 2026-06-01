import { drive, withTimeout } from '@/lib/google-auth';
import { PDFParse } from 'pdf-parse';
import { ImageAnnotatorClient } from '@google-cloud/vision';

interface PDFEntry {
  fileName: string;
  folder: string;
  text: string;
}

interface PDFCache {
  entries: PDFEntry[];
  loadedAt: number | null;
}

declare global {
  // eslint-disable-next-line no-var
  var __pdfCache: PDFCache | undefined;
}
if (!globalThis.__pdfCache) {
  globalThis.__pdfCache = { entries: [], loadedAt: null };
}
const cache = globalThis.__pdfCache;

// Singleton Vision client
let visionClient: ImageAnnotatorClient | null = null;
function getVisionClient(): ImageAnnotatorClient {
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

function hasUsableText(text: string): boolean {
  const stripped = text.replace(/--\s*\d+\s*of\s*\d+\s*--/g, '').replace(/\s+/g, ' ').trim();
  return stripped.length > 200;
}

async function ocrPDFWithVision(buffer: Buffer, pageCount: number): Promise<string> {
  const client = getVisionClient();
  const content = buffer.toString('base64');
  const texts: string[] = [];

  for (let start = 1; start <= pageCount; start += 5) {
    const pages: number[] = [];
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

async function getFolderIdByName(parentId: string, name: string): Promise<string | null> {
  try {
    const res = await withTimeout(drive.files.list({
      q: `'${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false`,
      fields: 'files(id)',
      pageSize: 1,
    }));
    return res.data.files?.[0]?.id ?? null;
  } catch {
    return null;
  }
}

async function listPDFs(folderId: string): Promise<Array<{ id: string; name: string }>> {
  try {
    const res = await withTimeout(drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/pdf' and trashed=false`,
      fields: 'files(id, name)',
      pageSize: 100,
    }));
    return (res.data.files ?? []).map(f => ({ id: f.id!, name: f.name! }));
  } catch {
    return [];
  }
}

async function downloadAndParse(fileId: string, fileName: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res: any = await withTimeout(
    drive.files.get({ fileId, alt: 'media' } as any, { responseType: 'arraybuffer' }) as any,
    15_000
  );
  const buffer = Buffer.from(res.data);

  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();

  if (hasUsableText(result.text)) {
    return result.text;
  }

  // Image-based (scanned) PDF — OCR each page via Vision API
  console.log(`[PDFCache] "${fileName}" is scanned — running OCR on ${result.total} pages`);
  const ocrText = await ocrPDFWithVision(buffer, result.total);
  console.log(`[PDFCache] OCR complete for "${fileName}" — ${ocrText.length} chars extracted`);
  return ocrText;
}

export async function preloadPDFCache(): Promise<void> {
  const rootId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!rootId) {
    console.error('[PDFCache] GOOGLE_DRIVE_FOLDER_ID not set');
    return;
  }

  const itrFolderId = await getFolderIdByName(rootId, 'Annual Reports and ITR');
  if (!itrFolderId) {
    console.error('[PDFCache] "Annual Reports and ITR" folder not found');
    return;
  }

  const [arFolderId, itrSubFolderId] = await Promise.all([
    getFolderIdByName(itrFolderId, 'Annual Reports'),
    getFolderIdByName(itrFolderId, 'Income Tax Returns'),
  ]);

  const subfolders: Array<{ id: string | null; label: string }> = [
    { id: arFolderId, label: 'Annual Reports' },
    { id: itrSubFolderId, label: 'Income Tax Returns' },
  ];

  const entries: PDFEntry[] = [];

  for (const { id, label } of subfolders) {
    if (!id) continue;
    const files = await listPDFs(id);
    for (const file of files) {
      try {
        const text = await downloadAndParse(file.id, file.name);
        entries.push({ fileName: file.name, folder: label, text });
      } catch (err) {
        console.error(`[PDFCache] Failed to process ${file.name}:`, err);
      }
    }
  }

  cache.entries = entries;
  cache.loadedAt = Date.now();
  console.log(`[PDFCache] Loaded ${entries.length} PDFs`);
}

export function startRefreshLoop(intervalMinutes: number): void {
  const interval = setInterval(() => preloadPDFCache(), intervalMinutes * 60 * 1000);
  interval.unref?.();
}

export function getPDFContext(): string {
  if (cache.entries.length === 0) return '';

  const annual = cache.entries.filter(e => e.folder === 'Annual Reports');
  const itr = cache.entries.filter(e => e.folder === 'Income Tax Returns');
  const sections: string[] = [];

  if (annual.length > 0) {
    sections.push('## ANNUAL REPORTS\n');
    for (const e of annual) {
      sections.push(`### Annual Report: ${e.fileName.replace('.pdf', '')}\n${e.text}`);
    }
  }

  if (itr.length > 0) {
    sections.push('## INCOME TAX RETURNS\n');
    for (const e of itr) {
      sections.push(`### ITR: ${e.fileName.replace('.pdf', '')}\n${e.text}`);
    }
  }

  return sections.join('\n\n');
}

export function isCacheLoaded(): boolean {
  return cache.loadedAt !== null;
}
