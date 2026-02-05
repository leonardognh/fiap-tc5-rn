import { UpdateUserPreferencesUseCase } from '@/lib/application/settings/use-cases/update-user-preferences.use-case';
import { WatchUserPreferencesUseCase } from '@/lib/application/settings/use-cases/watch-user-preferences.use-case';
import {
  DEFAULT_USER_PREFERENCES,
  UserPreferences,
  UserPreferencesPatch,
} from '@/lib/core/settings/user-preferences';
import { Unsubscribe } from '@/lib/core/settings/user-preferences.repository';
import { FirestoreUserPreferencesRepository } from '@/lib/infrastructure/firebase/user-preferences.firestore.repository';
import { create } from 'zustand';

type SettingsState = {
  preferences: UserPreferences;
  loading: boolean;
  saving: boolean;
  error: string | null;

  connect: (uid: string) => Unsubscribe;
  update: (uid: string, patch: UserPreferencesPatch) => Promise<void>;
  clearError: () => void;
};

const repo = new FirestoreUserPreferencesRepository();
const watchUC = new WatchUserPreferencesUseCase(repo);
const updateUC = new UpdateUserPreferencesUseCase(repo);

export const useSettingsStore = create<SettingsState>((set) => ({
  preferences: DEFAULT_USER_PREFERENCES,
  loading: false,
  saving: false,
  error: null,

  clearError: () => set({ error: null }),

  connect: (uid: string) => {
    set({ loading: true, error: null });

    const unsub = watchUC.execute(
      uid,
      (prefs) => set({ preferences: prefs, loading: false }),
      (e) =>
        set({ error: (e as any)?.message ?? 'Falha ao carregar preferências.', loading: false })
    );

    return unsub;
  },

  update: async (uid, patch) => {
    set({ saving: true, error: null });
    try {
      await updateUC.execute(uid, patch);
      // o watch vai atualizar o estado — não inventa moda aqui
    } catch (e: any) {
      set({ error: e?.message ?? 'Falha ao salvar preferências.' });
    } finally {
      set({ saving: false });
    }
  },
}));
