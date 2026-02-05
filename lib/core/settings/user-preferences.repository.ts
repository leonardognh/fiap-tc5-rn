import { UserPreferences, UserPreferencesPatch } from './user-preferences';

export type Unsubscribe = () => void;

export interface UserPreferencesRepository {
  watch(
    uid: string,
    onChange: (prefs: UserPreferences) => void,
    onError?: (e: unknown) => void
  ): Unsubscribe;
  update(uid: string, patch: UserPreferencesPatch): Promise<void>;
}
