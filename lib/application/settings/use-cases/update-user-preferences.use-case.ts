import { UserPreferencesPatch } from '@/lib/core/contracts/user-preferences';
import { UserPreferencesRepository } from '@/lib/core/settings/user-preferences.repository';

export class UpdateUserPreferencesUseCase {
  constructor(private readonly repo: UserPreferencesRepository) {}

  execute(uid: string, patch: UserPreferencesPatch): Promise<void> {
    return this.repo.update(uid, patch);
  }
}
