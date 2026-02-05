import { useAuthStore } from '@/lib/state/auth.store';
import { Redirect, Stack } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const { user, initializing, connect } = useAuthStore();

  useEffect(() => {
    const unsub = connect();
    return unsub;
  }, [connect]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!user ? <Redirect href="/(auth)/login" /> : <Redirect href="/(app)/boards" />}
    </Stack>
  );
}
