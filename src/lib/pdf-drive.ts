// src/lib/pdf-drive.ts
import { google } from 'googleapis';
import { cache } from 'react';

const MAIN_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID!;

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

const drive = google.drive({ version: 'v3', auth });

interface PDFFile {
  id: string;
  name: string;
  year: string;
  downloadLink: string;
  viewLink: string;
}

// Helper to get folder ID by path
const getFolderIdByPath = cache(async (folderPath: string[]): Promise<string | null> => {
  let currentParentId = MAIN_FOLDER_ID;
  
  for (const folderName of folderPath) {
    try {
      const res = await drive.files.list({
        q: `'${currentParentId}' in parents and mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
        fields: 'files(id)',
        pageSize: 1,
      });
      
      const folderId = res.data.files?.[0]?.id;
      if (!folderId) {
        console.error(`Folder "${folderName}" not found in path:`, folderPath);
        return null;
      }
      currentParentId = folderId;
    } catch (error) {
      console.error(`Error fetching folder "${folderName}":`, error);
      return null;
    }
  }
  
  return currentParentId;
});

// Fetch PDFs from a specific folder path
export const getPDFsFromDrive = cache(async (folderPath: string[]): Promise<PDFFile[]> => {
  const folderId = await getFolderIdByPath(folderPath);
  
  if (!folderId) {
    return [];
  }

  try {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/pdf' and trashed=false`,
      fields: 'files(id, name)',
      orderBy: 'name desc',
      pageSize: 50,
    });

    return res.data.files ? res.data.files.map(file => {
      // Extract year from filename (e.g., "2024-2025.pdf" -> "2024-2025")
      const year = file.name!.replace('.pdf', '');
      
      return {
        id: file.id!,
        name: file.name!,
        year: year,
        downloadLink: `https://drive.google.com/uc?export=download&id=${file.id}`,
        viewLink: `https://drive.google.com/file/d/${file.id}/view`,
      };
    }) : [];
  } catch (error) {
    console.error(`Error fetching PDFs from folder path:`, folderPath, error);
    return [];
  }
});

// Fetch Annual Reports
export const getAnnualReports = cache(async (): Promise<PDFFile[]> => {
  return getPDFsFromDrive(['Annual Reports and ITR', 'Annual Reports']);
});

// Fetch Income Tax Returns
export const getIncomeTaxReturns = cache(async (): Promise<PDFFile[]> => {
  return getPDFsFromDrive(['Annual Reports and ITR', 'Income Tax Returns']);
});
