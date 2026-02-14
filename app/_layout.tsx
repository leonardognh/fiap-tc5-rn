import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { useAuthStore } from "@/src/auth/store/auth.store";
import { useSettingsStore } from "@/src/settings/store/settings.store";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
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
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const connect = useAuthStore((s) => s.connect);
  const user = useAuthStore((s) => s.user);
  const initializing = useAuthStore((s) => s.initializing);
  const connectSettings = useSettingsStore((s) => s.connect);
  const preferences = useSettingsStore((s) => s.preferences);

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

    if (!user && inApp) router.replace("/");
    else if (user && inAuth) router.replace("/(app)/(tabs)");
  }, [user, initializing, segments]);

  const themeMode = preferences?.theme ?? "system";
  const resolvedTheme =
    themeMode === "system"
      ? (colorScheme as "light" | "dark") || "light"
      : themeMode;

  return (
    <GluestackUIProvider mode={resolvedTheme as "light" | "dark"}>
      <ThemeProvider value={resolvedTheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
        </Stack>
      </ThemeProvider>
    </GluestackUIProvider>
  );
}
