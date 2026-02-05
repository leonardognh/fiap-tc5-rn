import { getApp, getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const firebaseAuth = getAuth(app);
export const firestore = getFirestore(app);

const USE_EMULATOR = __DEV__;

function getEmulatorHost() {
  if (Platform.OS === 'web') return 'localhost';
  if (Platform.OS === 'android') return '10.0.2.2';
  return 'localhost';
}
console.log('🚀 ~ USE_EMULATOR:', USE_EMULATOR);

if (USE_EMULATOR) {
  const host = getEmulatorHost();

  connectAuthEmulator(firebaseAuth, `http://${host}:9099`);

  connectFirestoreEmulator(firestore, host, 8080);
}
