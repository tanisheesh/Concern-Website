import { cert, getApps, initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialise once — safe to call from multiple server modules
if (!getApps().length) {
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey  = process.env.FIREBASE_PRIVATE_KEY;

  if (clientEmail && privateKey) {
    // Local dev: set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env.local
    // Get a service-account key from Firebase Console → Project Settings → Service Accounts
    initializeApp({
      credential: cert({
        projectId:   'concern-website',
        clientEmail,
        privateKey:  privateKey.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    // Firebase App Hosting / GCP: Application Default Credentials work automatically
    initializeApp({
      credential: applicationDefault(),
      projectId:  'concern-website',
    });
  }
}

export const adminAuth = getAuth();
