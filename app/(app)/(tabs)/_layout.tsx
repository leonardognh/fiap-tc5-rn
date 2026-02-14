import React from "react";
import { Alert, Platform, Pressable, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, useRouter } from "expo-router";
import { LogOut } from "lucide-react-native";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useAuthStore } from "@/src/auth/store/auth.store";

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
  const iconColor = Colors[colorScheme ?? "light"].text;
  const confirmLogout = () => {
    const handleLogout = async () => {
      try {
        await logout();
        router.replace("/login");
      } catch {
        Alert.alert("Erro", "Não foi possível sair. Tente novamente.");
      }
    };

    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm("Deseja sair do app?")) {
        void handleLogout();
      }
      return;
    }

    Alert.alert("Sair", "Deseja sair do app?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => void handleLogout() },
    ]);
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: useClientOnlyValue(false, true),
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
          tabBarIcon: ({ color }) => <TabBarIcon name="columns" color={color} />,
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
  );
}
