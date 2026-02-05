import { UserPreferences } from '@/lib/core/settings/user-preferences';
import {
  Unsubscribe,
  UserPreferencesRepository,
} from '@/lib/core/settings/user-preferences.repository';

export class WatchUserPreferencesUseCase {
  constructor(private readonly repo: UserPreferencesRepository) {}

  execute(
    uid: string,
    onChange: (prefs: UserPreferences) => void,
    onError?: (e: unknown) => void
  ): Unsubscribe {
    return this.repo.watch(uid, onChange, onError);
  }
}
