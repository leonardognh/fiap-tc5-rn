import { useAuthStore } from '@/lib/state/auth.store';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';

type Props = {
  onGoLogin?: () => void;
  onGoHome?: () => void;
};

export function RegisterScreen({ onGoLogin, onGoHome }: Props) {
  const { user, loading, error, clearError, register } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const canSubmit = useMemo(() => {
    return name.trim().length >= 2 && email.trim().length > 3 && password.length >= 6 && !loading;
  }, [name, email, password, loading]);

  React.useEffect(() => {
    if (error) {
      Alert.alert('Cadastro', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error, clearError]);

  React.useEffect(() => {
    if (user) onGoHome?.();
  }, [user, onGoHome]);

  const onSubmit = async () => {
    await register(name, email, password);
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center', gap: 12 }}>
      <Text style={{ fontSize: 28, fontWeight: '700' }}>Criar conta</Text>
      <Text style={{ opacity: 0.7 }}>Sem romance: cria, entra e toca o projeto.</Text>

      <View style={{ gap: 10, marginTop: 12 }}>
        <Text style={{ fontWeight: '600' }}>Nome</Text>
        <TextInput
          placeholder="Seu nome"
          value={name}
          onChangeText={setName}
          style={{
            borderWidth: 1,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        />

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
          placeholder="mínimo 6 caracteres"
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
          {loading ? <ActivityIndicator /> : <Text style={{ fontWeight: '700' }}>Cadastrar</Text>}
        </Pressable>

        <Pressable onPress={onGoLogin} style={{ paddingVertical: 10, alignItems: 'center' }}>
          <Text style={{ fontWeight: '600' }}>Já tem conta? Entrar</Text>
        </Pressable>
      </View>
    </View>
  );
}
