// Firebase configuration
// For local development, use environment variables from .env.local
// For Firebase App Hosting, these are automatically provided
export const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-2319423145-218b4",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:165593041898:web:62e30c00e9ef8e51580093",
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDugQgQjbv6bS2Et3lgikThsszbRdNX3os",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-2319423145-218b4.firebaseapp.com",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "165593041898",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "studio-2319423145-218b4.firebasestorage.app",
};
