export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'pt' | 'en';

export type UserPreferences = {
  theme: ThemeMode;
  language: Language;

  enableAnimations: boolean;
  focusMode: boolean;
  detailsMode: boolean;

  fontScale: number;
  spaceScale: number;
  contrast: number;

  showAlerts: boolean;
};

export type UserPreferencesPatch = Partial<UserPreferences>;

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'system',
  language: 'pt',
  enableAnimations: true,
  focusMode: false,
  detailsMode: true,
  fontScale: 1,
  spaceScale: 1,
  contrast: 1,
  showAlerts: true,
};
