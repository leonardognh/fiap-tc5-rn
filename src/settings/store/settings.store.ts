import {
  signOut,
  updateProfile as updateAuthProfile,
  updateEmail,
  updatePassword,
} from "firebase/auth";
import { create } from "zustand";

import { firebaseAuth } from "@/src/infrastructure/firebase/firebase.client";
import * as repo from "../data/settings.repository";
import type {
  UserPreferences,
  UserPreferencesPatch,
  UserProfile,
  UserProfilePatch,
} from "../types/settings";
import { DEFAULT_PREFERENCES } from "../types/settings";

type SettingsState = {
  userId: string | null;
  profile: UserProfile | null;
  preferences: UserPreferences;
  loading: boolean;
  error: string | null;
  unsubscribe?: () => void;
  connect: (userId: string | null) => () => void;
  updateProfile: (patch: UserProfilePatch) => Promise<void>;
  updatePreferences: (patch: UserPreferencesPatch) => Promise<void>;
  clearError: () => void;
  logout: () => Promise<void>;
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  userId: null,
  profile: null,
  preferences: DEFAULT_PREFERENCES,
  loading: false,
  error: null,

  connect: (userId) => {
    const currentUnsub = get().unsubscribe;
    if (currentUnsub) currentUnsub();

    if (!userId) {
      set({
        userId: null,
        profile: null,
        preferences: DEFAULT_PREFERENCES,
        loading: false,
        error: null,
        unsubscribe: undefined,
      });
      return () => {};
    }

    set({ userId, loading: true, error: null });

    let pending = 2;
    const done = () => {
      pending -= 1;
      if (pending <= 0) set({ loading: false });
    };

    const unsubProfile = repo.watchUserProfile(
      userId,
      (profile) => {
        set({ profile });
        done();
      },
      (err) =>
        set({
          error: err.message ?? "Falha ao carregar perfil.",
          loading: false,
        }),
    );

    const unsubPrefs = repo.watchUserPreferences(
      userId,
      (preferences) => {
        set({ preferences });
        done();
      },
      (err) =>
        set({
          error: err.message ?? "Falha ao carregar preferências.",
          loading: false,
        }),
    );

    const unsubscribe = () => {
      unsubProfile();
      unsubPrefs();
    };

    set({ unsubscribe });
    return unsubscribe;
  },

  updateProfile: async (patch) => {
    const user = firebaseAuth.currentUser;
    const userId = get().userId;
    if (!user || !userId || user.uid !== userId) {
      set({ error: "Usuário não autenticado." });
      return;
    }

    set({ error: null, loading: true });

    try {
      const wantsDisplayName = typeof patch.displayName === "string";
      const wantsPhoto = "photoURL" in patch;
      const wantsEmail = "email" in patch;
      const wantsPassword = "password" in patch;

      if (wantsDisplayName || wantsPhoto) {
        await updateAuthProfile(user, {
          displayName: wantsDisplayName
            ? patch.displayName?.trim() || "Sem nome"
            : undefined,
          photoURL: wantsPhoto ? patch.photoURL || undefined : undefined,
        });
      }

      if (wantsEmail && patch.email) {
        const email = patch.email.trim();
        if (email && email !== user.email) {
          await updateEmail(user, email);
        }
      }

      if (wantsPassword && patch.password) {
        await updatePassword(user, patch.password);
      }

      const firestorePatch: UserProfilePatch = {
        ...(typeof patch.displayName === "string"
          ? { displayName: patch.displayName.trim() || "Sem nome" }
          : {}),
        ...("photoURL" in patch
          ? { photoURL: patch.photoURL || undefined }
          : {}),
        ...("email" in patch ? { email: patch.email || undefined } : {}),
      };

      await repo.updateUserProfileDoc(userId, firestorePatch);
    } catch (err: any) {
      const code = String(err?.code ?? "");
      if (code === "auth/requires-recent-login") {
        set({ error: "Faça login novamente para atualizar seus dados." });
        await signOut(firebaseAuth);
      } else {
        set({ error: err?.message ?? "Falha ao atualizar perfil." });
      }
    } finally {
      set({ loading: false });
    }
  },

  updatePreferences: async (patch) => {
    const userId = get().userId;
    if (!userId) {
      set({ error: "Usuário não autenticado." });
      return;
    }

    const prev = get().preferences;
    const next: UserPreferences = {
      ...prev,
      ...patch,
      cognitiveAlerts: {
        ...prev.cognitiveAlerts,
        ...(patch.cognitiveAlerts ?? {}),
      },
    };

    set({ preferences: next, error: null });

    try {
      await repo.updateUserPreferencesDoc(userId, patch);
    } catch (err: any) {
      set({
        preferences: prev,
        error: err?.message ?? "Falha ao atualizar preferências.",
      });
    }
  },

  clearError: () => set({ error: null }),

  logout: async () => {
    await signOut(firebaseAuth);
  },
}));
