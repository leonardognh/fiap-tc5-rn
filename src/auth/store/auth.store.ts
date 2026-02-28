import { create } from "zustand";
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { firebaseAuth } from "@/src/infrastructure/firebase/firebase.client";
import { ensureUserDoc } from "@/src/settings/data/settings.repository";
import i18n from "@/src/utils/i18n";

type AuthState = {
  user: User | null;
  initializing: boolean;
  loading: boolean;
  error: string | null;

  connect: () => () => void;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;

  clearError: () => void;
};

const normalizeAuthError = (e: any): string => {
  const code = String(e?.code ?? "");
  switch (code) {
    case "auth/invalid-email":
      return i18n.t("auth.errors.invalid_email");
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return i18n.t("auth.errors.wrong_credentials");
    case "auth/email-already-in-use":
      return i18n.t("auth.errors.email_in_use");
    case "auth/weak-password":
      return i18n.t("auth.errors.weak_password");
    case "auth/too-many-requests":
      return i18n.t("auth.errors.too_many_requests");
    default:
      return i18n.t("auth.errors.auth_failed");
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  initializing: true,
  loading: false,
  error: null,

  connect: () => {
    const unsub = onAuthStateChanged(
      firebaseAuth,
      (user) => set({ user, initializing: false }),
      () =>
        set({
          user: null,
          initializing: false,
          error: i18n.t("auth.errors.session_failed"),
        }),
    );
    return unsub;
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const cred = await signInWithEmailAndPassword(
        firebaseAuth,
        email.trim(),
        password,
      );
      try {
        await ensureUserDoc(cred.user.uid, {
          displayName: cred.user.displayName ?? null,
          email: cred.user.email ?? email.trim(),
          photoURL: cred.user.photoURL ?? null,
        });
      } catch {

      }
    } catch (e) {
      set({ error: normalizeAuthError(e) });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const cred = await createUserWithEmailAndPassword(
        firebaseAuth,
        email.trim(),
        password,
      );
      const displayName = name.trim();
      if (displayName) await updateProfile(cred.user, { displayName });
      try {
        await ensureUserDoc(cred.user.uid, {
          displayName: displayName || null,
          email: cred.user.email ?? email.trim(),
          photoURL: cred.user.photoURL ?? null,
        });
      } catch {

      }
    } catch (e) {
      set({ error: normalizeAuthError(e) });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  forgotPassword: async (email) => {
    set({ loading: true, error: null });
    try {
      await sendPasswordResetEmail(firebaseAuth, email.trim());
    } catch (e) {
      set({ error: normalizeAuthError(e) });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      await signOut(firebaseAuth);
    } catch (e) {
      set({ error: i18n.t("auth.errors.logout_failed") });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
