import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { auth } from '@/lib/infrastructure/firebase/firebase.client';
import { useSettingsStore } from '@/lib/state/settings.store';

type AuthContextValue = {
  user: User | null;
  initializing: boolean;
  loading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

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
      return 'Senha fraca.';
    default:
      return 'Erro de autenticação.';
  }
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setProfile, resetAll } = useSettingsStore.getState();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setInitializing(false);

      if (u) {
        setProfile({
          name: u.displayName ?? '',
          email: u.email ?? '',
          avatarUrl: u.photoURL ?? '',
        });
      } else {
        resetAll();
      }
    });

    return unsub;
  }, [setProfile, resetAll]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      setError(normalizeAuthError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
    } catch (e) {
      setError(normalizeAuthError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await signOut(auth);
    } catch (e) {
      setError(normalizeAuthError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = () => setError(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      loading,
      error,
      login,
      register,
      logout,
      clearError,
    }),
    [user, initializing, loading, error, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider />');
  }
  return ctx;
}
