import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
  try {
    const MAIN_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

    if (!MAIN_FOLDER_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
      return NextResponse.json({ 
        error: 'Missing environment variables',
        has: {
          folderId: !!MAIN_FOLDER_ID,
          email: !!CLIENT_EMAIL,
          key: !!PRIVATE_KEY
        }
      }, { status: 500 });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // List folders in Website Content
    const res = await drive.files.list({
      q: `'${MAIN_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      pageSize: 10,
    });

    return NextResponse.json({
      success: true,
      mainFolderId: MAIN_FOLDER_ID,
      folders: res.data.files || []
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
