/**
 * Storage abstraction for the Social Media Portal.
 *
 * Media files are stored in Google Drive using the existing service account
 * already configured for the public website (read-only scope is insufficient
 * for uploads — see note below).
 *
 * NOTE: The current Google Drive service account uses `drive.readonly` scope.
 * When the Media Library is implemented (Phase 2), the service account will
 * need to be granted `drive.file` scope to allow uploads.
 *
 * For now this module provides:
 *   - MIME type and file size validation (reusable in Phase 2)
 *   - A placeholder upload interface that Phase 2 will implement
 *   - No Firebase Storage references anywhere
 */

import { randomUUID } from 'crypto';
import path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StorageFolder = 'media' | 'posters' | 'documents' | 'avatars';

export interface UploadResult {
  /** Google Drive file ID */
  driveFileId: string;
  /** Public HTTPS URL for the file */
  publicUrl: string;
  /** Sanitised file name */
  fileName: string;
  fileSize: number;
  mimeType: string;
}

// ---------------------------------------------------------------------------
// Allowed MIME types per folder
// ---------------------------------------------------------------------------

const ALLOWED_MIME_TYPES: Record<StorageFolder, string[]> = {
  media: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
  ],
  posters: ['image/jpeg', 'image/png', 'image/webp'],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  avatars: ['image/jpeg', 'image/png', 'image/webp'],
};

// Max file sizes in bytes
const MAX_FILE_SIZES: Record<StorageFolder, number> = {
  media: 500 * 1024 * 1024,    // 500 MB (videos)
  posters: 20 * 1024 * 1024,   // 20 MB
  documents: 50 * 1024 * 1024, // 50 MB
  avatars: 5 * 1024 * 1024,    // 5 MB
};

// ---------------------------------------------------------------------------
// Validation (used by Phase 2 upload routes)
// ---------------------------------------------------------------------------

export function validateUpload(
  mimeType: string,
  fileSize: number,
  folder: StorageFolder
): void {
  const allowed = ALLOWED_MIME_TYPES[folder];
  if (!allowed.includes(mimeType)) {
    throw new Error(
      `File type "${mimeType}" is not allowed in the "${folder}" folder. ` +
        `Allowed types: ${allowed.join(', ')}`
    );
  }

  const maxSize = MAX_FILE_SIZES[folder];
  if (fileSize > maxSize) {
    const maxMB = Math.round(maxSize / (1024 * 1024));
    throw new Error(
      `File size ${Math.round(fileSize / (1024 * 1024))} MB exceeds the ` +
        `${maxMB} MB limit for the "${folder}" folder.`
    );
  }
}

// ---------------------------------------------------------------------------
// File name helper
// ---------------------------------------------------------------------------

/**
 * Generates a unique, sanitised file name for an uploaded file.
 * Format: {uuid}{ext}
 */
export function buildFileName(originalFileName: string): string {
  const ext = path.extname(originalFileName).toLowerCase();
  return `${randomUUID()}${ext}`;
}

// ---------------------------------------------------------------------------
// Upload placeholder (Phase 2 will implement this)
// ---------------------------------------------------------------------------

/**
 * Uploads a file to Google Drive and returns the result.
 *
 * Phase 2 implementation will:
 *   1. Use the googleapis Drive v3 client (already installed)
 *   2. Upload to the social-media portal folder in Drive
 *   3. Set file permissions to publicly readable
 *   4. Return the Drive file ID and public URL
 *
 * The service account will need `drive.file` scope added in Phase 2.
 */
export async function uploadToDrive(
  _buffer: Buffer,
  _mimeType: string,
  _originalFileName: string,
  _folder: StorageFolder
): Promise<UploadResult> {
  throw new Error(
    'uploadToDrive is not yet implemented. ' +
      'Media upload will be available in Phase 2 (Media Library).'
  );
}

/**
 * Deletes a file from Google Drive by its file ID.
 * Phase 2 will implement this.
 */
export async function deleteFromDrive(_driveFileId: string): Promise<void> {
  throw new Error(
    'deleteFromDrive is not yet implemented. ' +
      'Media deletion will be available in Phase 2 (Media Library).'
  );
}
