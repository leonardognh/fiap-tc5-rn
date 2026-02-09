import {
  DEFAULT_USER_PREFERENCES,
  UserPreferences,
  UserPreferencesPatch,
} from '@/lib/core/contracts/user-preferences';
import {
  Unsubscribe,
  UserPreferencesRepository,
} from '@/lib/core/settings/user-preferences.repository';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase.client';

const prefsDoc = (uid: string) => doc(db, 'userPreferences', uid);

export class FirestoreUserPreferencesRepository implements UserPreferencesRepository {
  watch(
    uid: string,
    onChange: (prefs: UserPreferences) => void,
    onError?: (e: unknown) => void
  ): Unsubscribe {
    return onSnapshot(
      prefsDoc(uid),
      async (snap) => {
        if (!snap.exists()) {
          await setDoc(prefsDoc(uid), DEFAULT_USER_PREFERENCES, { merge: true });
          onChange(DEFAULT_USER_PREFERENCES);
          return;
        }

        const data = (snap.data() ?? {}) as Partial<UserPreferences>;
        onChange({ ...DEFAULT_USER_PREFERENCES, ...data });
      },
      (e) => onError?.(e)
    );
  }

  async update(uid: string, patch: UserPreferencesPatch): Promise<void> {
    await setDoc(prefsDoc(uid), DEFAULT_USER_PREFERENCES, { merge: true });
    await updateDoc(prefsDoc(uid), patch as any);
  }
}
