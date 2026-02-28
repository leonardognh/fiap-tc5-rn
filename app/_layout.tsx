import "react-native-gesture-handler";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { useAuthStore } from "@/src/auth/store/auth.store";
import { useSettingsStore } from "@/src/settings/store/settings.store";
import "@/src/utils/i18n";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Platform, useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("@/assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const { i18n } = useTranslation();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();

  const connect = useAuthStore((s) => s.connect);
  const user = useAuthStore((s) => s.user);
  const initializing = useAuthStore((s) => s.initializing);
  const connectSettings = useSettingsStore((s) => s.connect);
  const preferences = useSettingsStore((s) => s.preferences);

  useEffect(() => {
    if (preferences?.language) {
      i18n.changeLanguage(preferences.language);
    }
  }, [preferences?.language, i18n]);

  useEffect(() => {
    return connect();
  }, [connect]);

  useEffect(() => {
    return connectSettings(user?.uid ?? null);
  }, [user?.uid, connectSettings]);

  useEffect(() => {
    if (initializing) return;
    const group = segments[0];
    const inAuth = group === "(auth)";
    const inApp = group === "(app)";

    if (!user && inApp) router.replace("/login");
    else if (user && inAuth) router.replace("/(app)/(tabs)");
  }, [user, initializing, segments, router]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const active = document.activeElement as HTMLElement | null;
    if (active && typeof active.blur === "function") {
      active.blur();
    }
  }, [segments]);

  const themeMode = preferences?.theme ?? "system";
  const resolvedTheme =
    themeMode === "system"
      ? (colorScheme as "light" | "dark") || "light"
      : (themeMode as "light" | "dark");
  const contrastMode = preferences?.contrast ?? "normal";

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GluestackUIProvider mode={resolvedTheme} contrast={contrastMode}>
        <ThemeProvider
          value={resolvedTheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
          </Stack>
        </ThemeProvider>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}
