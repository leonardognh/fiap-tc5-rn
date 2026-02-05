import { useAuthStore } from '@/lib/state/auth.store';
import { useSettingsStore } from '@/lib/state/settings.store';
import { Tabs } from 'expo-router';
import { useEffect } from 'react';

export default function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const connectPrefs = useSettingsStore((s) => s.connect);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = connectPrefs(user.uid);
    return unsub;
  }, [user?.uid, connectPrefs]);

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="boards" options={{ title: 'Boards' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
