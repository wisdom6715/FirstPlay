import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDzEwZ17vr_dQr4GwKt7g9_HJyNg1dZvaQ',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'firstplay-7bd63.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'firstplay-7bd63',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'firstplay-7bd63.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '500436337213',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:500436337213:web:b9787c1bfa87aa706ee054',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-N6L8HZM93V'
};

export const firebaseConfigured = true;
export const firebaseApp: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth: Auth = getAuth(firebaseApp);
export const firebaseDb: Firestore = getFirestore(firebaseApp);
export const firebaseStorage: FirebaseStorage = getStorage(firebaseApp, 'gs://firstplay-7bd63.firebasestorage.app');
export const configuredAdminEmail = process.env.NEXT_PUBLIC_FIREBASE_ADMIN_EMAIL?.trim().toLowerCase() ?? '';
