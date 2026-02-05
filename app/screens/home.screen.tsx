import { useAuthStore } from '@/lib/state/auth.store';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

type Props = {
  onGoLogin?: () => void;
};

export function HomeScreen({ onGoLogin }: Props) {
  const { user, loading, logout } = useAuthStore();

  React.useEffect(() => {
    if (!user) onGoLogin?.();
  }, [user, onGoLogin]);

  const displayName = user?.displayName?.trim() || user?.email?.trim() || 'Usuário';

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center', gap: 14 }}>
      <Text style={{ fontSize: 26, fontWeight: '800' }}>Home</Text>
      <Text style={{ fontSize: 16, opacity: 0.8 }}>Olá, {displayName}. Sim, você está logado.</Text>

      <View style={{ marginTop: 18, gap: 10 }}>
        <Pressable
          onPress={logout}
          style={{
            borderWidth: 1,
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: 'center',
          }}
          disabled={loading}>
          {loading ? <ActivityIndicator /> : <Text style={{ fontWeight: '700' }}>Sair</Text>}
        </Pressable>

        <Text style={{ opacity: 0.6 }}>
          Próximo passo: lista de Boards aqui. (Sem pressa, mas sem desculpa.)
        </Text>
      </View>
    </View>
  );
}
