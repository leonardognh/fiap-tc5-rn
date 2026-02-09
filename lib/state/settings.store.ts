import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_USER_PREFERENCES, UserPreferences } from '../core/contracts/user-preferences';

export type UserProfile = {
  name: string;
  email: string;
  avatarUrl: string;
};

type SettingsState = {
  profile: UserProfile;
  preferences: UserPreferences;
  _hasHydrated: boolean;

  setProfile: (patch: Partial<UserProfile>) => void;
  setPreferences: (patch: Partial<UserPreferences>) => void;
  setCognitiveAlerts: (patch: Partial<UserPreferences['cognitiveAlerts']>) => void;
  setHasHydrated: (state: boolean) => void;

  resetPreferences: () => void;
  resetAll: () => void;
};

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  email: '',
  avatarUrl: '',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      preferences: DEFAULT_USER_PREFERENCES,
      _hasHydrated: false,

      setProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),

      setPreferences: (patch) =>
        set((s) => ({
          preferences: { ...s.preferences, ...patch },
        })),

      setCognitiveAlerts: (patch) =>
        set((s) => ({
          preferences: {
            ...s.preferences,
            cognitiveAlerts: { ...s.preferences.cognitiveAlerts, ...patch },
          },
        })),

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      resetPreferences: () => set({ preferences: DEFAULT_USER_PREFERENCES }),

      resetAll: () =>
        set({
          profile: DEFAULT_PROFILE,
          preferences: DEFAULT_USER_PREFERENCES,
        }),
    }),
    {
      name: 'mindease.settings',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
