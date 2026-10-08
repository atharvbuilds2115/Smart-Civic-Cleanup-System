import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

// Firebase configuration for Cleanup-System project
// Get these values from: Firebase Console → Project Settings → Web App Config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://cleanup-system-default-rtdb.firebaseio.com",
};

// Strictly validate Firebase configuration and fail loudly if missing critical values
const requiredFirebaseEnv = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

const missingEnv = requiredFirebaseEnv.filter((key) => {
  const value = import.meta.env[key];
  return !value || value === 'YOUR_API_KEY_HERE' || value === 'YOUR_MESSAGING_SENDER_ID_HERE' || value === 'YOUR_APP_ID_HERE';
});

export const firebaseConfigError =
  missingEnv.length > 0
    ? `Firebase config incomplete. Missing or placeholder env vars: ${missingEnv.join(', ')}. Update .env.local and restart the dev server.`
    : null;

// Initialize Firebase only when required config exists
const app: FirebaseApp | null = firebaseConfigError ? null : initializeApp(firebaseConfig);

type AuthInstance = ReturnType<typeof getAuth>;
type FirestoreInstance = ReturnType<typeof getFirestore>;
type DatabaseInstance = ReturnType<typeof getDatabase>;
type StorageInstance = ReturnType<typeof getStorage>;

// Initialize Firebase services
export const auth = app ? getAuth(app) : (null as unknown as AuthInstance);
export const db = app ? getFirestore(app) : (null as unknown as FirestoreInstance); // Firestore Database
export const rtdb = app ? getDatabase(app) : (null as unknown as DatabaseInstance); // Realtime Database (alternative to Firestore)
export const storage = app ? getStorage(app) : (null as unknown as StorageInstance); // Cloud Storage for image uploads
export default app;
