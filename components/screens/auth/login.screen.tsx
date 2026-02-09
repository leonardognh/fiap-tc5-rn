import { useAuthStore } from '@/lib/state/auth.store';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';

type Props = {
  onGoRegister?: () => void;
  onGoHome?: () => void;
};

export function LoginScreen({ onGoRegister, onGoHome }: Props) {
  const { user, loading, error, clearError, login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const canSubmit = useMemo(() => {
    return email.trim().length > 3 && password.length >= 6 && !loading;
  }, [email, password, loading]);

  React.useEffect(() => {
    if (error) {
      Alert.alert('Login', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error, clearError]);

  React.useEffect(() => {
    if (user) onGoHome?.();
  }, [user, onGoHome]);

  const onSubmit = async () => {
    await login(email, password);
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center', gap: 12 }}>
      <Text style={{ fontSize: 28, fontWeight: '700' }}>Entrar</Text>
      <Text style={{ opacity: 0.7 }}>Bem-vindo. Bora fazer as coisas acontecerem.</Text>

      <View style={{ gap: 10, marginTop: 12 }}>
        <Text style={{ fontWeight: '600' }}>Email</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="seu@email.com"
          value={email}
          onChangeText={setEmail}
          style={{
            borderWidth: 1,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        />

        <Text style={{ fontWeight: '600' }}>Senha</Text>
        <TextInput
          secureTextEntry
          placeholder="••••••"
          value={password}
          onChangeText={setPassword}
          style={{
            borderWidth: 1,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        />

        <Pressable
          onPress={onSubmit}
          disabled={!canSubmit}
          style={{
            marginTop: 10,
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: 'center',
            opacity: canSubmit ? 1 : 0.4,
            borderWidth: 1,
          }}>
          {loading ? <ActivityIndicator /> : <Text style={{ fontWeight: '700' }}>Entrar</Text>}
        </Pressable>

        <Pressable onPress={onGoRegister} style={{ paddingVertical: 10, alignItems: 'center' }}>
          <Text style={{ fontWeight: '600' }}>Não tem conta? Criar agora</Text>
        </Pressable>
      </View>
    </View>
  );
}
