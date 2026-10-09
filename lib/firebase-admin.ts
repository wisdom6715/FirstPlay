import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

export const firebaseAdminConfigured = Boolean(projectId && clientEmail && privateKey && storageBucket);

let cachedServices: { app: App; auth: Auth; db: Firestore; storage: Storage; bucket: ReturnType<Storage['bucket']> } | null = null;

export function getAdminServices() {
  if (!firebaseAdminConfigured) return null;
  if (cachedServices) return cachedServices;
  const app = getApps()[0] ?? initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket
  });
  const storage = getStorage(app);
  cachedServices = { app, auth: getAuth(app), db: getFirestore(app), storage, bucket: storage.bucket() };
  return cachedServices;
}

export function getConfiguredAdminEmail() {
  return (process.env.FIREBASE_ADMIN_EMAIL || process.env.NEXT_PUBLIC_FIREBASE_ADMIN_EMAIL || '').trim().toLowerCase();
}
