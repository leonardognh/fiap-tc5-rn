import {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { firebaseDb } from "@/src/infrastructure/firebase/firebase.client";
import type {
  UserPreferences,
  UserPreferencesPatch,
  UserProfile,
  UserProfilePatch,
} from "../types/settings";
import { DEFAULT_PREFERENCES } from "../types/settings";

type WatchCallback<T> = (value: T) => void;
type ErrorCallback = (error: Error) => void;

export function watchUserProfile(
  userId: string,
  onData: WatchCallback<UserProfile | null>,
  onError?: ErrorCallback,
) {
  const ref = doc(firebaseDb, "users", userId);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        onData({
          id: userId,
          displayName: "Sem nome",
          email: undefined,
          photoURL: undefined,
          updatedAt: undefined,
        });
        return;
      }
      const data: any = snap.data() ?? {};
      onData({
        id: userId,
        displayName: data.displayName ?? "Sem nome",
        email: data.email,
        photoURL: data.photoURL,
        updatedAt: data.updatedAt,
      });
    },
    (error) => onError?.(error as Error),
  );
}

export function watchUserPreferences(
  userId: string,
  onData: WatchCallback<UserPreferences>,
  onError?: ErrorCallback,
) {
  const ref = doc(firebaseDb, "users", userId, "settings", "preferences");
  return onSnapshot(
    ref,
    (snap) => {
      const data: any = snap.exists() ? snap.data() : {};
      onData({
        ...DEFAULT_PREFERENCES,
        ...(data ?? {}),
        cognitiveAlerts: {
          ...DEFAULT_PREFERENCES.cognitiveAlerts,
          ...(data?.cognitiveAlerts ?? {}),
        },
      });
    },
    (error) => onError?.(error as Error),
  );
}

export async function updateUserProfileDoc(
  userId: string,
  patch: UserProfilePatch,
) {
  const ref = doc(firebaseDb, "users", userId);
  const cleanPatch = Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined),
  );
  await updateDoc(ref, { ...cleanPatch, updatedAt: Date.now() });
}

export async function upsertUserProfileDoc(
  userId: string,
  patch: UserProfilePatch,
) {
  const ref = doc(firebaseDb, "users", userId);
  const cleanPatch = Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined),
  );
  await setDoc(ref, { ...cleanPatch, updatedAt: Date.now() }, { merge: true });
}

export async function updateUserPreferencesDoc(
  userId: string,
  patch: UserPreferencesPatch,
) {
  const ref = doc(firebaseDb, "users", userId, "settings", "preferences");
  await setDoc(
    ref,
    {
      ...patch,
      updatedAt: Date.now(),
    },
    { merge: true },
  );
}
