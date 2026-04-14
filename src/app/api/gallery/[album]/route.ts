
// src/app/api/gallery/[album]/route.ts
import { NextResponse } from 'next/server';
import { google } from 'googleapis';

// This is the main folder (Website Content)
const MAIN_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID!;

const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

const drive = google.drive({ version: 'v3', auth });

// A simple in-memory cache to avoid repeatedly fetching folder IDs.
const folderIdCache = new Map<string, string>();

async function getFolderId(folderName: string, parentId: string): Promise<string | null> {
    const cacheKey = `${parentId}-${folderName}`;
    if (folderIdCache.has(cacheKey)) {
        return folderIdCache.get(cacheKey)!;
    }

    try {
        const res = await drive.files.list({
            q: `'${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
            fields: 'files(id, name)', // We only need id and name
            pageSize: 1,
        });
        const folder = res.data.files?.[0];
        if (folder?.id) {
            folderIdCache.set(cacheKey, folder.id);
            return folder.id;
        }
        return null;
    } catch (error) {
        console.error(`Error fetching ID for folder "${folderName}":`, error);
        return null;
    }
}

// Function to find an album folder ID by its name within a list of possible parent folders.
async function findAlbumFolderId(albumName: string, parentFolderNames: string[]): Promise<string | null> {
    // MAIN_FOLDER_ID is already "Website Content", so get Gallery folder from it
    const galleryFolderId = await getFolderId('Gallery', MAIN_FOLDER_ID);
    if (!galleryFolderId) {
        console.error('Gallery folder not found in Website Content folder');
        return null;
    }

    // Now search in "By Year" or "Programmes and Events" inside Gallery
    for (const parentName of parentFolderNames) {
        const parentFolderId = await getFolderId(parentName, galleryFolderId);
        if (parentFolderId) {
            const albumFolderId = await getFolderId(albumName, parentFolderId);
            if (albumFolderId) {
                return albumFolderId;
            }
        }
    }
    return null;
}

// Helper to convert a slug back to a title case name.
function slugToTitle(slug: string): string {
  // Handle specific mappings first
  const specificMappings: { [key: string]: string } = {
    'ministry-of-social-justice-and-empowerment': 'Ministry of Social Justice and Empowerment',
    'synopsis': 'Synopsis',
    'training-programmes': 'Training Programmes',
    'video-clips': 'Video Clips',
    'concern-premises': 'Concern Premises',
    'awareness-programmes': 'Awareness Programmes',
    'award-recognitions': 'Awards & Recognitions', // Updated to match new folder name
    'awards-recognitions': 'Awards & Recognitions', // Alternative slug mapping
    'sanctuary': 'Sanctuary',
  };

  // Check if we have a specific mapping
  if (specificMappings[slug]) {
    return specificMappings[slug];
  }

  // Default conversion for years and other albums
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ album: string }> }
) {
  const { album: albumSlug } = await params;
  
  if (!albumSlug) {
      return NextResponse.json({ error: 'Album slug is required' }, { status: 400 });
  }

  // Convert slug to a potential folder name.
  const albumName = slugToTitle(albumSlug);
  
  try {
    // Search for the album folder in both possible parent directories.
    const albumFolderId = await findAlbumFolderId(albumName, ['Programmes and Events', 'By Year']);

    if (!albumFolderId) {
        return NextResponse.json({ error: `Album folder '${albumName}' not found` }, { status: 404 });
    }
    
    // List all images and videos in the album folder with pagination.
    let media: { id: string; name: string; url: string; isVideo: boolean; mimeType: string; }[] = [];
    let pageToken: string | undefined = undefined;

    do {
      const mediaRes: any = await drive.files.list({
        q: `'${albumFolderId}' in parents and (mimeType contains 'image/' or mimeType contains 'video/') and trashed=false`,
        fields: 'nextPageToken, files(id, name, mimeType)',
        pageSize: 1000, // Max page size
        pageToken: pageToken,
      });

      const files = mediaRes.data.files;
      if (files && files.length > 0) {
        const mappedMedia = files.map((file: any) => {
          const isVideo = file.mimeType?.startsWith('video/') || false;
          return {
            id: file.id!,
            name: file.name!,
            mimeType: file.mimeType!,
            isVideo,
            // Use our proxy API endpoint to serve media
            url: isVideo ? `/api/video/${file.id}` : `/api/image/${file.id}`,
          };
        });
        media = media.concat(mappedMedia);
      }
      
      pageToken = mediaRes.data.nextPageToken;

    } while (pageToken);

    return NextResponse.json(media);

  } catch (error) {
    console.error('Google Drive API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch images from Google Drive' }, { status: 500 });
  }
}
