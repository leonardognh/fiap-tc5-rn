import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  AuthError,
} from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../infrastructure/firebase/firebase.client';
import { useSettingsStore } from '../state/settings.store';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

/**
 * Traduz erros do Firebase Auth para português
 */
function translateAuthError(error: AuthError): string {
  const errorMessages: Record<string, string> = {
    'auth/invalid-email': 'Email inválido',
    'auth/user-disabled': 'Usuário desabilitado',
    'auth/user-not-found': 'Usuário não encontrado',
    'auth/wrong-password': 'Senha incorreta',
    'auth/email-already-in-use': 'Email já está em uso',
    'auth/weak-password': 'Senha muito fraca. Use pelo menos 6 caracteres',
    'auth/operation-not-allowed': 'Operação não permitida',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
    'auth/network-request-failed': 'Erro de conexão. Verifique sua internet',
    'auth/invalid-credential': 'Credenciais inválidas',
  };

  return errorMessages[error.code] || 'Erro desconhecido ao autenticar';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setProfile = useSettingsStore((s) => s.setProfile);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        setLoading(false);

        // Sincroniza perfil com settings store
        if (user) {
          setProfile({
            email: user.email || '',
            name: user.displayName || '',
            avatarUrl: user.photoURL || '',
          });
        }
      },
      (error) => {
        console.error('Auth state change error:', error);
        setError('Erro ao verificar autenticação');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [setProfile]);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const authError = err as AuthError;
      const message = translateAuthError(authError);
      setError(message);
      throw new Error(message);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const authError = err as AuthError;
      const message = translateAuthError(authError);
      setError(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      
      // Limpa o perfil do store
      setProfile({
        email: '',
        name: '',
        avatarUrl: '',
      });
    } catch (err) {
      const authError = err as AuthError;
      const message = translateAuthError(authError);
      setError(message);
      throw new Error(message);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        signIn, 
        signUp, 
        logout, 
        error, 
        clearError 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};
