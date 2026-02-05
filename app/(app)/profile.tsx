import { useAuthStore } from '@/lib/state/auth.store';
import { useSettingsStore } from '@/lib/state/settings.store';
import React from 'react';
import { ActivityIndicator, Pressable, Switch, Text, View } from 'react-native';

function Row({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right: React.ReactNode;
}) {
  return (
    <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.08)' }}>
      <Text style={{ fontSize: 16, fontWeight: '700' }}>{title}</Text>
      {!!subtitle && <Text style={{ marginTop: 4, opacity: 0.7 }}>{subtitle}</Text>}
      <View style={{ marginTop: 10, alignItems: 'flex-start' }}>{right}</View>
    </View>
  );
}

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const { preferences, loading, saving, error, update } = useSettingsStore();

  const uid = user?.uid!;
  const displayName = user?.displayName?.trim() || user?.email?.trim() || 'Usuário';

  if (!uid) return null;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 26, fontWeight: '800' }}>Perfil</Text>
      <Text style={{ opacity: 0.75 }}>Olá, {displayName}. Vamos domar sua interface.</Text>

      {!!error && (
        <View
          style={{
            padding: 12,
            borderWidth: 1,
            borderColor: 'rgba(255,0,0,0.25)',
            borderRadius: 12,
          }}>
          <Text style={{ color: 'crimson', fontWeight: '700' }}>{error}</Text>
        </View>
      )}

      <View style={{ marginTop: 10 }}>
        <Row
          title="Modo de foco"
          subtitle="Esconde distrações. Seu cérebro agradece."
          right={
            <Switch
              value={preferences.focusMode}
              onValueChange={(v) => update(uid, { focusMode: v })}
              disabled={saving}
            />
          }
        />

        <Row
          title="Modo detalhado"
          subtitle="Mais informação (se você aguentar)."
          right={
            <Switch
              value={preferences.detailsMode}
              onValueChange={(v) => update(uid, { detailsMode: v })}
              disabled={saving}
            />
          }
        />

        <Row
          title="Animações"
          subtitle="Desliga se estiver te irritando (eu entendo)."
          right={
            <Switch
              value={preferences.enableAnimations}
              onValueChange={(v) => update(uid, { enableAnimations: v })}
              disabled={saving}
            />
          }
        />

        <Row
          title="Alertas"
          subtitle="Toasts/avisos cognitivos. Pode calar tudo aqui."
          right={
            <Switch
              value={preferences.showAlerts}
              onValueChange={(v) => update(uid, { showAlerts: v })}
              disabled={saving}
            />
          }
        />
      </View>

      <Pressable
        onPress={logout}
        style={{
          marginTop: 'auto',
          borderWidth: 1,
          borderRadius: 12,
          paddingVertical: 12,
          alignItems: 'center',
        }}
        disabled={saving}>
        {saving ? <ActivityIndicator /> : <Text style={{ fontWeight: '800' }}>Sair</Text>}
      </Pressable>
    </View>
  );
}
