import React, { useState } from "react";
import {
  Alert,
  Easing,
  Pressable,
  View,
  useWindowDimensions,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, useRouter } from "expo-router";
import { LogOut } from "lucide-react-native";

import { ConfirmModal } from "@/components/modals/ConfirmModal";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useAuthStore } from "@/src/auth/store/auth.store";
import { useSettingsStore } from "@/src/settings/store/settings.store";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const preferences = useSettingsStore((s) => s.preferences);
  const iconColor = Colors[colorScheme ?? "light"].text;
  const [logoutOpen, setLogoutOpen] = useState(false);
  const screenWidth = useWindowDimensions().width;
  const animationsEnabled = preferences.animations;

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch {
      Alert.alert("Erro", "Não foi possível sair. Tente novamente.");
    }
  };

  const confirmLogout = () => setLogoutOpen(true);

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: useClientOnlyValue(false, true),
          sceneStyleInterpolator: animationsEnabled
            ? ({ current }) => ({
                sceneStyle: {
                  opacity: current.progress.interpolate({
                    inputRange: [-1, 0, 1],
                    outputRange: [0.6, 1, 0.6],
                  }),
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [-1, 0, 1],
                        outputRange: [-screenWidth, 0, screenWidth],
                      }),
                    },
                  ],
                },
              })
            : undefined,
          transitionSpec: animationsEnabled
            ? {
                animation: "timing",
                config: {
                  duration: 520,
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                },
              }
            : undefined,
          headerRight: () => (
            <View style={{ marginRight: 12 }}>
              <Pressable
                onPress={confirmLogout}
                hitSlop={8}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 999,
                  padding: 8,
                  borderWidth: 1,
                  borderColor: iconColor,
                }}
              >
                <LogOut size={18} color="#000" />
              </Pressable>
            </View>
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Boards",
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="columns" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="two"
          options={{
            title: "Configurações",
            tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
          }}
        />
      </Tabs>

      <ConfirmModal
        visible={logoutOpen}
        title="Sair"
        message="Deseja sair do app?"
        confirmLabel="Sair"
        destructive
        onClose={() => setLogoutOpen(false)}
        onConfirm={() => void handleLogout()}
      />
    </>
  );
}

