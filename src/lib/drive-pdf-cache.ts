import pdfData from '@/data/pdf-data.json';

interface PDFEntry {
  fileName: string;
  folder: string;
  text: string;
}

export function getPDFContext(): string {
  const entries = pdfData.entries as PDFEntry[];
  if (entries.length === 0) return '';

  const annual = entries.filter(e => e.folder === 'Annual Reports');
  const itr = entries.filter(e => e.folder === 'Income Tax Returns');
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
  return pdfData.entries.length > 0;
}
