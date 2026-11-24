import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

/**
 * Firebase Web Configuration
 * Connected to project: gozi-4d81e
 */
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyDkyo7HCnxjlNUdTWenoNsHWDboecAHgdM",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "gozi-4d81e.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "gozi-4d81e",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "gozi-4d81e.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "238036732699",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:238036732699:web:43efbdb9c1b906c1e5e1be",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-VSQ6HCN72V"
};

let app: any;
let db: Firestore | null = null;
let isFirebaseConnected = false;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
  isFirebaseConnected = true;
  console.log('[Gozi Firebase] Initialized successfully with project:', firebaseConfig.projectId);
} catch (error) {
  console.warn('[Gozi Firebase] Initialization fallback to mock memory mode:', error);
  isFirebaseConnected = false;
}

export { app, db, isFirebaseConnected, firebaseConfig };
