export type UserPreferences = {
  id?: string;

  theme: ThemeMode;
  animations: boolean;
  language: Language;

  restoreLastWorkspace: boolean;
  rememberLastRoute: boolean;
  confirmDestructive: boolean;

  uiComplexity: UiComplexity;
  focusMode: boolean;
  pomodoroPause: boolean;
  detailsMode: DetailsMode;

  contrast: ContrastMode;
  fontScale: number;
  spaceScale: number;

  cognitiveAlerts: CognitiveAlerts;
};

export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'pt-BR' | 'en-US';
export type UiComplexity = 'minimum' | 'normal';
export type DetailsMode = 'summary' | 'detailed';
export type ContrastMode = 'normal' | 'high';

export type CognitiveAlerts = {
  enabled: boolean;
  taskMaxMinutes: number;
  pomodoroPause: boolean;
  transitionWarnings: boolean;
};

// ✅ Mudou de USER_PREFERENCES_DEFAULTS para DEFAULT_USER_PREFERENCES
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'system',
  animations: true,
  language: 'pt-BR',

  restoreLastWorkspace: true,
  rememberLastRoute: true,
  confirmDestructive: true,

  uiComplexity: 'normal',
  focusMode: false,
  pomodoroPause: false,
  detailsMode: 'summary',

  contrast: 'normal',
  fontScale: 0,
  spaceScale: 1,

  cognitiveAlerts: {
    enabled: true,
    taskMaxMinutes: 45,
    pomodoroPause: false,
    transitionWarnings: true,
  },
};

export type UserPreferencesPatch = Partial<UserPreferences>;
