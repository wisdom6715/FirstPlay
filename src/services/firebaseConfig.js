import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { optimizeImage } from '../utils/imageUtils';

// FirstPlay Firebase Configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDzEwZ17vr_dQr4GwKt7g9_HJyNg1dZvaQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "firstplay-7bd63.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "firstplay-7bd63",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "firstplay-7bd63.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "500436337213",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:500436337213:web:b9787c1bfa87aa706ee054",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-N6L8HZM93V"
};

let app = null;
let db = null;
let storage = null;
let auth = null;
let analytics = null;
let isFirebaseLive = false;

try {
  // Initialize Firebase app singleton
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  // Initialize Cloud Firestore database
  db = getFirestore(app);

  // Initialize Firebase Auth
  try {
    auth = getAuth(app);
  } catch (authInitErr) {
    console.warn('[FirstPlay] Firebase Auth init warning:', authInitErr.message);
  }

  // Initialize Cloud Storage
  try {
    storage = getStorage(app);
  } catch (storageInitErr) {
    console.warn('[FirstPlay] Firebase Storage init warning:', storageInitErr.message);
  }

  isFirebaseLive = true;

  // Initialize Firebase Analytics if supported in this environment
  if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
        console.info('[FirstPlay] Firebase Analytics active');
      }
    }).catch(() => {
      // Gracefully silent in environments without analytics storage
    });
  }

  console.info(`[FirstPlay] Firebase connected to project: ${firebaseConfig.projectId}`);
} catch (error) {
  console.warn('[FirstPlay] Firebase initialization warning, falling back to local cache:', error.message);
  isFirebaseLive = false;
}

/**
 * Actively ping Firestore to confirm the database connection is live and responding
 * @returns {Promise<{ active: boolean, error?: string }>}
 */
export async function checkFirebaseActive() {
  if (!isFirebaseLive || !db) {
    return { active: false, error: 'Firebase is not initialized or configured.' };
  }

  try {
    const q = query(collection(db, 'apps'), limit(1));
    await getDocs(q);
    return { active: true };
  } catch (err) {
    try {
      const q2 = query(collection(db, 'listings'), limit(1));
      await getDocs(q2);
      return { active: true };
    } catch (err2) {
      console.warn('[FirstPlay] Firebase health check failed:', err2);
      return { active: false, error: err.message || 'Unable to connect to Firebase database.' };
    }
  }
}

/**
 * Upload an image asset to Firebase Storage matching official FirstPlay architecture:
 * gs://firstplay-7bd63.firebasestorage.app/FirstPlay/{logos|flyers|banners}/{timestamp}_{filename}
 * 
 * @param {File} file - User uploaded image file
 * @param {'logos' | 'flyers' | 'banners'} folder - Subfolder in FirstPlay/
 * @returns {Promise<string>} Public download URL or fallback optimized asset
 */
export async function uploadPromotionAsset(file, folder = 'logos') {
  if (!file) return '';

  // Max dimension parameters matching FirstPlay mobile & web specs
  const isLogo = folder === 'logos' || folder === 'logo';
  const isFlyer = folder === 'flyers' || folder === 'flyer';
  const maxWidth = isLogo ? 512 : isFlyer ? 800 : 1280;
  const maxHeight = isLogo ? 512 : isFlyer ? 1000 : 720;
  const quality = isLogo ? 0.9 : 0.85;

  const { blob, dataUrl } = await optimizeImage(file, maxWidth, maxHeight, quality);

  // If Firebase Storage is initialized, upload to FirstPlay/{folder}/...
  if (storage && isFirebaseLive) {
    try {
      const cleanName = (file.name || 'image').replace(/[^a-zA-Z0-9.-]/g, '_');
      const timestamp = Date.now();
      const storagePath = `FirstPlay/${folder}/${timestamp}_${cleanName}`;
      const storageRef = ref(storage, storagePath);

      const snapshot = await uploadBytes(storageRef, blob, {
        contentType: blob.type || file.type || 'image/jpeg',
        customMetadata: {
          category: folder,
          uploaded_at: new Date().toISOString()
        }
      });
      const downloadUrl = await getDownloadURL(snapshot.ref);
      console.info(`[FirstPlay Storage] Uploaded asset to ${storagePath}:`, downloadUrl);
      return downloadUrl;
    } catch (storageErr) {
      console.warn(`[FirstPlay Storage] Storage upload returned (${storageErr.code || storageErr.message}), storing optimized asset directly.`);
      return dataUrl;
    }
  }

  return dataUrl;
}

export { app, db, storage, auth, analytics, isFirebaseLive };
