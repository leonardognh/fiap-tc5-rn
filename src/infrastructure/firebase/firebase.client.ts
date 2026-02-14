import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  connectAuthEmulator,
  getAuth,
  initializeAuth,
  type Auth,
} from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
};

export const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

const useEmulators = process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === "1";
const emulatorHost =
  process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST ??
  (Platform.OS === "android" ? "10.0.2.2" : "127.0.0.1");
const emulatorKey = "__FIREBASE_EMULATORS_CONNECTED__";

function createAuth(): Auth {
  if (Platform.OS === "web") return getAuth(firebaseApp);

  return initializeAuth(firebaseApp, {
    persistence: AsyncStorage as any,
  });
}

export const firebaseAuth = createAuth();
export const firebaseDb = getFirestore(firebaseApp);

if (useEmulators && !(globalThis as any)[emulatorKey]) {
  try {
    connectAuthEmulator(firebaseAuth, `http://${emulatorHost}:9099`);
  } catch {
    // ignore if already connected (fast refresh)
  }

  try {
    connectFirestoreEmulator(firebaseDb, emulatorHost, 8080);
  } catch {
    // ignore if already connected (fast refresh)
  }

  (globalThis as any)[emulatorKey] = true;
}
