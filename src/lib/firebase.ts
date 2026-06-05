import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCmgBYXQOvN9iiEQt1n7mb0Dx3LCalJu70',
  authDomain: 'concern-website.firebaseapp.com',
  projectId: 'concern-website',
  storageBucket: 'concern-website.firebasestorage.app',
  messagingSenderId: '922104939217',
  appId: '1:922104939217:web:a6411d63ac1c33783e3bf0',
  measurementId: 'G-B9CFJMBHR9',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const clientAuth = getAuth(app);
