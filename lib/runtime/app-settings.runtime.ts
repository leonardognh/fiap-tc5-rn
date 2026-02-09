import { useEffect } from 'react';
import { ContrastMode, Language, ThemeMode } from '../core/contracts/user-preferences';
import { useSettingsStore } from '../state/settings.store';

export type ThemeBridge = { setTheme: (t: ThemeMode) => void };
export type LanguageBridge = { setLanguage: (l: Language) => void };
export type ContrastBridge = { setContrast: (c: ContrastMode) => void };

export function useApplyAppSettings(opts: {
  theme: ThemeBridge;
  language?: LanguageBridge;
  contrast?: ContrastBridge;
}) {
  const prefs = useSettingsStore((s) => s.preferences);

  useEffect(() => {
    opts.theme.setTheme(prefs.theme);
    opts.language?.setLanguage(prefs.language);
    opts.contrast?.setContrast(prefs.contrast);
  }, [prefs.theme, prefs.language, prefs.contrast]);
}
