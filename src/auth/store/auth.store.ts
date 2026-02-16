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
import { upsertUserProfileDoc } from "@/src/settings/data/settings.repository";

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
      return "Email inválido.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email ou senha incorretos.";
    case "auth/email-already-in-use":
      return "Esse email já está em uso.";
    case "auth/weak-password":
      return "Senha fraca. Use pelo menos 6 caracteres.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Aguarde e tente novamente.";
    default:
      return "Erro de autenticação.";
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
          error: "Falha ao verificar sessão.",
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
        await upsertUserProfileDoc(cred.user.uid, {
          displayName: cred.user.displayName ?? "Sem nome",
          email: cred.user.email ?? email.trim(),
          photoURL: cred.user.photoURL ?? undefined,
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
        await upsertUserProfileDoc(cred.user.uid, {
          displayName: displayName || "Sem nome",
          email: cred.user.email ?? email.trim(),
          photoURL: cred.user.photoURL ?? undefined,
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
      set({ error: "Falha ao sair." });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
