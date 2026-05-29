// src/lib/pdf-drive.ts
import { drive, withTimeout } from '@/lib/google-auth';

const MAIN_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID!;

interface PDFFile {
  id: string;
  name: string;
  year: string;
  downloadLink: string;
  viewLink: string;
}

interface CacheEntry { id: string; expiresAt: number }
const folderIdCache = new Map<string, CacheEntry>();
const FOLDER_CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getCachedFolderId(key: string): string | null {
  const cached = folderIdCache.get(key);
  if (cached && Date.now() < cached.expiresAt) return cached.id;
  return null;
}

function setCachedFolderId(key: string, id: string): void {
  if (folderIdCache.size >= 200) {
    const firstKey = folderIdCache.keys().next().value;
    if (firstKey) folderIdCache.delete(firstKey);
  }
  folderIdCache.set(key, { id, expiresAt: Date.now() + FOLDER_CACHE_TTL });
}

const getFolderIdByPath = async (folderPath: string[]): Promise<string | null> => {
  let currentParentId = MAIN_FOLDER_ID;

  for (const folderName of folderPath) {
    const cacheKey = `${currentParentId}::${folderName}`;
    const cached = getCachedFolderId(cacheKey);
    if (cached) {
      currentParentId = cached;
      continue;
    }

    try {
      const res = await withTimeout(drive.files.list({
        q: `'${currentParentId}' in parents and mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
        fields: 'files(id)',
        pageSize: 1,
      }));

      const folderId = res.data.files?.[0]?.id;
      if (!folderId) {
        console.error(`Folder "${folderName}" not found in path:`, folderPath);
        return null;
      }
      setCachedFolderId(cacheKey, folderId);
      currentParentId = folderId;
    } catch (error) {
      console.error(`Error fetching folder "${folderName}":`, error);
      return null;
    }
  }

  return currentParentId;
};

export const getPDFsFromDrive = async (folderPath: string[]): Promise<PDFFile[]> => {
  const folderId = await getFolderIdByPath(folderPath);

  if (!folderId) {
    return [];
  }

  try {
    const res = await withTimeout(drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/pdf' and trashed=false`,
      fields: 'files(id, name)',
      orderBy: 'name desc',
      pageSize: 50,
    }));

    return res.data.files ? res.data.files.map(file => {
      const year = file.name!.replace('.pdf', '');
      return {
        id: file.id!,
        name: file.name!,
        year,
        downloadLink: `https://drive.google.com/uc?export=download&id=${file.id}`,
        viewLink: `https://drive.google.com/file/d/${file.id}/view`,
      };
    }) : [];
  } catch (error) {
    console.error(`Error fetching PDFs from folder path:`, folderPath, error);
    return [];
  }
};

export const getAnnualReports = async (): Promise<PDFFile[]> => {
  return getPDFsFromDrive(['Annual Reports and ITR', 'Annual Reports']);
};

export const getIncomeTaxReturns = async (): Promise<PDFFile[]> => {
  return getPDFsFromDrive(['Annual Reports and ITR', 'Income Tax Returns']);
};
