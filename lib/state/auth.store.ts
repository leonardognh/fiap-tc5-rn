import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { create } from 'zustand';
import { firebaseAuth } from '../infrastructure/firebase/firebase.client';

type AuthState = {
  user: User | null;
  initializing: boolean;
  loading: boolean;
  error: string | null;

  connect: () => () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

const normalizeAuthError = (e: any): string => {
  const code = String(e?.code ?? '');
  switch (code) {
    case 'auth/invalid-email':
      return 'Email inválido.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email ou senha incorretos.';
    case 'auth/email-already-in-use':
      return 'Esse email já está em uso.';
    case 'auth/weak-password':
      return 'Senha fraca. Use pelo menos 6 caracteres.';
    case 'auth/network-request-failed':
      return 'Sem conexão. Verifique sua internet.';
    default:
      return e?.message ? String(e.message) : 'Falha de autenticação.';
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  initializing: true,
  loading: false,
  error: null,

  connect: () => {
    const unsub = onAuthStateChanged(firebaseAuth, (user) => {
      set({ user, initializing: false });
    });
    return unsub;
  },

  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
    } catch (e: any) {
      set({ error: normalizeAuthError(e) });
    } finally {
      set({ loading: false });
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const cred = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);

      const displayName = name.trim();
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
    } catch (e: any) {
      set({ error: normalizeAuthError(e) });
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      await signOut(firebaseAuth);
    } catch (e: any) {
      set({ error: normalizeAuthError(e) });
    } finally {
      set({ loading: false });
    }
  },
}));
