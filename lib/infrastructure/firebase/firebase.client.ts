import { getApp, getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

const USE_EMULATOR = __DEV__ && process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === '1';

function resolveEmulatorHost() {
  const envHost = process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST;
  if (envHost) return envHost;

  if (Platform.OS === 'web') return 'localhost';
  if (Platform.OS === 'android') return '10.0.2.2';
  return 'localhost';
}

declare global {
  var __FIREBASE_EMU_CONNECTED__: boolean | undefined;
}

if (USE_EMULATOR && !globalThis.__FIREBASE_EMU_CONNECTED__) {
  globalThis.__FIREBASE_EMU_CONNECTED__ = true;

  const host = resolveEmulatorHost();

  connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(db, host, 8080);

  console.log(`[firebase] emulators ON @ ${host}`);
} else {
  console.log('[firebase] emulators OFF');
}
