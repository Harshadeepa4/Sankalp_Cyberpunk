import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Explicitly define the app variable type
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Promise<Analytics | null>;

try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");

  // Assign Firebase services safely
  auth = getAuth(app);
  db = getFirestore(app);
  analytics = isSupported().then(yes => (yes ? getAnalytics(app) : null)).catch(() => null);
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

// Export Firebase services with fallbacks to avoid `undefined`
export { app, auth, db, analytics };
