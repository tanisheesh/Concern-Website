
// src/lib/google-drive.ts
import { cache } from 'react';
import { drive, withTimeout } from '@/lib/google-auth';

const MAIN_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID!;

interface DriveFile {
  id: string;
  name: string;
  thumbnailLink?: string | null | undefined;
  webViewLink: string | null | undefined;
  webContentLink: string | null | undefined;
  mimeType?: string;
  isVideo?: boolean;
}

// Helper to get folder ID by path (supports nested folders)
const getFolderIdByPath = cache(async (folderPath: string[]): Promise<string | null> => {
  let currentParentId = MAIN_FOLDER_ID;

  for (const folderName of folderPath) {
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
      currentParentId = folderId;
    } catch (error) {
      console.error(`Error fetching folder "${folderName}":`, error);
      return null;
    }
  }

  return currentParentId;
});

const getFolderId = cache(async (folderName: string, parentId: string): Promise<string | null> => {
  try {
    const res = await withTimeout(drive.files.list({
      q: `'${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
      fields: 'files(id)',
      pageSize: 1,
    }));
    return res.data.files?.[0]?.id || null;
  } catch (error) {
    console.error(`Error fetching folder ID for "${folderName}":`, error);
    return null;
  }
});

export const getMediaFromDrive = cache(async (folderName: string): Promise<DriveFile[]> => {
  const galleryFolderId = await getFolderIdByPath(['Gallery']);

  if (!galleryFolderId) {
    console.error('Gallery folder not found');
    return [];
  }

  const albumFolderId = await getFolderId(folderName, galleryFolderId);

  if (!albumFolderId) {
    return [];
  }

  try {
    const res = await withTimeout(drive.files.list({
      q: `'${albumFolderId}' in parents and (mimeType contains 'image/' or mimeType contains 'video/') and trashed=false`,
      fields: 'files(id, name, mimeType)',
      pageSize: 100,
    }));

    return res.data.files ? res.data.files.map(file => {
        const isVideo = file.mimeType?.startsWith('video/') || false;
        const thumbnailLink = `https://drive.google.com/thumbnail?id=${file.id}&sz=w400`;
        return {
            id: file.id!,
            name: file.name!,
            mimeType: file.mimeType!,
            isVideo,
            thumbnailLink,
            webViewLink: `https://drive.google.com/file/d/${file.id}/view`,
            webContentLink: isVideo
                ? `https://drive.google.com/file/d/${file.id}/preview`
                : `https://drive.google.com/thumbnail?id=${file.id}&sz=w2000`,
        };
    }) : [];
  } catch (error) {
    console.error(`Error fetching media from folder "${folderName}":`, error);
    return [];
  }
});
