export type ThemeMode = "light" | "dark" | "system";
export type Language = "pt-BR" | "en-US";
export type UiComplexity = "normal" | "minimum";
export type DetailsMode = "detailed" | "summary";
export type ContrastMode = "normal" | "high";

export type CognitiveAlerts = {
  enabled: boolean;
  taskMaxMinutes: number;
  transitionScreen: boolean;
  pomodoroPause: boolean;
};

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

  updatedAt?: number;
};

export type UserPreferencesPatch = Partial<UserPreferences>;

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "system",
  animations: true,
  language: "pt-BR",

  restoreLastWorkspace: true,
  rememberLastRoute: true,
  confirmDestructive: true,

  uiComplexity: "normal",
  focusMode: false,
  pomodoroPause: true,
  detailsMode: "detailed",

  contrast: "normal",
  fontScale: 1,
  spaceScale: 1,

  cognitiveAlerts: {
    enabled: true,
    taskMaxMinutes: 30,
    transitionScreen: true,
    pomodoroPause: true,
  },
};

export type UserProfile = {
  id: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  updatedAt?: number;
};

export type UserProfilePatch = Partial<
  Pick<UserProfile, "displayName" | "photoURL" | "email">
> & {
  password?: string;
};
