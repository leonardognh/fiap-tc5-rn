import React from 'react';
import { Alert, ScrollView, View } from 'react-native';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';

import type {
  ContrastMode,
  DetailsMode,
  Language,
  ThemeMode,
  UiComplexity,
} from '@/lib/core/contracts/user-preferences';
import { useSettingsStore } from '@/lib/state/settings.store';

import { useAuth } from '@/lib/contexts/AuthContext';
import type { Option } from '@rn-primitives/select';

function mkOption(value: string, label = ''): Option {
  return { label, value } as unknown as Option;
}

function getOptionValue(opt?: Option): string | undefined {
  return (opt as any)?.value;
}

function SectionTitle({ children }: { children: string }) {
  return <Text className="mb-3 text-lg font-bold text-foreground">{children}</Text>;
}

function Row({
  title,
  description,
  right,
}: {
  title: string;
  description?: string;
  right: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center justify-between py-3">
      <View className="flex-1 pr-4">
        <Text className="text-sm font-medium text-foreground">{title}</Text>
        {!!description && (
          <Text className="mt-1 text-xs leading-4 text-muted-foreground">{description}</Text>
        )}
      </View>
      <View className="shrink-0">{right}</View>
    </View>
  );
}

export default function SettingsScreen() {
  const { logout } = useAuth();

  const profile = useSettingsStore((s) => s.profile);
  const preferences = useSettingsStore((s) => s.preferences);

  const setProfile = useSettingsStore((s) => s.setProfile);
  const setPreferences = useSettingsStore((s) => s.setPreferences);
  const setCognitiveAlerts = useSettingsStore((s) => s.setCognitiveAlerts);

  const initials = (profile.name || profile.email || 'U')
    .trim()
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const setTheme = (v: ThemeMode) => setPreferences({ theme: v });
  const setLanguage = (v: Language) => setPreferences({ language: v });
  const setContrast = (v: ContrastMode) => setPreferences({ contrast: v });
  const setComplexity = (v: UiComplexity) => setPreferences({ uiComplexity: v });
  const setDetailsMode = (v: DetailsMode) => setPreferences({ detailsMode: v });

  const handleSaveProfile = () => {
    // TODO: Implementar salvamento no Firebase
    Alert.alert('Sucesso', 'Perfil salvo com sucesso!');
  };

  const handleLoadProfile = () => {
    // TODO: Implementar carregamento do Firebase
    Alert.alert('Info', 'Carregando dados do perfil...');
  };

  const handleLogout = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="p-4 pb-20"
      showsVerticalScrollIndicator={false}>
      {/* PERFIL */}
      <SectionTitle>Perfil</SectionTitle>
      <Card className="mb-6 p-4">
        <View className="flex-row items-center gap-4">
          <Avatar className="h-16 w-16" alt="Avatar do perfil">
            <AvatarImage source={{ uri: profile.avatarUrl }} />
            <AvatarFallback>
              <Text className="text-base font-semibold">{initials}</Text>
            </AvatarFallback>
          </Avatar>

          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">
              {profile.name?.trim() || 'Sem nome'}
            </Text>
            <Text className="mt-0.5 text-sm text-muted-foreground">
              {profile.email || 'Email não disponível'}
            </Text>
          </View>
        </View>

        <Separator className="my-4" />

        <View className="gap-4">
          <View className="gap-1.5">
            <Label nativeID="name-input">Nome</Label>
            <Input
              aria-labelledby="name-input"
              value={profile.name}
              placeholder="Seu nome completo"
              onChangeText={(v: string) => setProfile({ name: v })}
            />
          </View>

          <View className="gap-1.5">
            <Label nativeID="email-input">Email</Label>
            <Input
              aria-labelledby="email-input"
              value={profile.email}
              editable={false}
              className="opacity-60"
            />
            <Text className="text-xs text-muted-foreground">O email não pode ser alterado</Text>
          </View>

          <View className="gap-1.5">
            <Label nativeID="avatar-input">URL do avatar</Label>
            <Input
              aria-labelledby="avatar-input"
              value={profile.avatarUrl}
              placeholder="https://exemplo.com/avatar.jpg"
              onChangeText={(v: string) => setProfile({ avatarUrl: v })}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          <View className="mt-2 flex-row gap-3">
            <Button className="flex-1" onPress={handleSaveProfile}>
              <Text>Salvar perfil</Text>
            </Button>
            <Button variant="secondary" className="flex-1" onPress={handleLoadProfile}>
              <Text>Recarregar</Text>
            </Button>
          </View>
        </View>
      </Card>

      {/* MODO FOCO */}
      <SectionTitle>Modo foco</SectionTitle>
      <Card className="mb-6 p-4">
        <Row
          title="Ativar modo foco"
          description="Reduz distrações limitando funcionalidades e simplificando a interface."
          right={
            <Switch
              checked={preferences.focusMode}
              onCheckedChange={(v: boolean) => setPreferences({ focusMode: v })}
            />
          }
        />
      </Card>

      {/* APARÊNCIA */}
      <SectionTitle>Aparência</SectionTitle>
      <Card className="mb-6 p-4">
        <View className="gap-0">
          {/* Tema */}
          <Row
            title="Tema"
            description="Escolha entre claro, escuro ou automático"
            right={
              <Select
                value={mkOption(preferences.theme)}
                onValueChange={(opt?: Option) => {
                  const v = getOptionValue(opt);
                  if (v === 'light' || v === 'dark' || v === 'system') setTheme(v);
                }}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem label="☀️ Claro" value="light" />
                  <SelectItem label="🌙 Escuro" value="dark" />
                  <SelectItem label="⚙️ Sistema" value="system" />
                </SelectContent>
              </Select>
            }
          />

          <Separator />

          {/* Idioma */}
          <Row
            title="Idioma"
            description="Idioma da interface"
            right={
              <Select
                value={mkOption(preferences.language)}
                onValueChange={(opt?: Option) => {
                  const v = getOptionValue(opt);
                  if (v === 'pt-BR' || v === 'en-US') setLanguage(v);
                }}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem label="🇧🇷 Português" value="pt-BR" />
                  <SelectItem label="🇺🇸 English" value="en-US" />
                </SelectContent>
              </Select>
            }
          />

          <Separator />

          {/* Animações */}
          <Row
            title="Animações"
            description="Ativa transições e efeitos visuais"
            right={
              <Switch
                checked={preferences.animations}
                onCheckedChange={(v: boolean) => setPreferences({ animations: v })}
              />
            }
          />

          <Separator />

          {/* Contraste */}
          <Row
            title="Alto contraste"
            description="Melhora a legibilidade com cores mais fortes"
            right={
              <Switch
                checked={preferences.contrast === 'high'}
                onCheckedChange={(v: boolean) => setContrast(v ? 'high' : 'normal')}
              />
            }
          />

          <Separator />

          {/* Espaçamento */}
          <Row
            title="Espaçamento ampliado"
            description="Aumenta o espaço entre elementos"
            right={
              <Switch
                checked={preferences.spaceScale > 1}
                onCheckedChange={(v: boolean) => setPreferences({ spaceScale: v ? 2 : 1 })}
              />
            }
          />

          <Separator />

          {/* Font scale */}
          <View className="py-4">
            <View className="mb-3 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-sm font-medium text-foreground">Tamanho da fonte</Text>
                <Text className="mt-1 text-xs text-muted-foreground">
                  Ajuste o tamanho do texto em toda a interface
                </Text>
              </View>
              <Text className="ml-4 text-sm font-semibold text-foreground">
                {Math.round(preferences.fontScale * 100)}%
              </Text>
            </View>

            <Slider
              containerClassName="w-full"
              minimumValue={0}
              maximumValue={1}
              step={0.1}
              value={preferences.fontScale}
              onValueChange={(value: number) => {
                const clamped = Math.max(0, Math.min(1, value));
                setPreferences({ fontScale: clamped });
              }}
            />
          </View>
        </View>
      </Card>

      {/* ALERTAS COGNITIVOS */}
      <SectionTitle>Alertas cognitivos</SectionTitle>
      <Card className="mb-6 p-4">
        <Row
          title="Ativar alertas"
          description="Sistema de notificações para melhor gestão do tempo"
          right={
            <Switch
              checked={preferences.cognitiveAlerts.enabled}
              onCheckedChange={(v: boolean) => setCognitiveAlerts({ enabled: v })}
            />
          }
        />

        <Separator />

        <Row
          title="Pausas Pomodoro"
          description="Pausa automática a cada 25 minutos de trabalho"
          right={
            <Switch
              checked={preferences.cognitiveAlerts.pomodoroPause}
              onCheckedChange={(v: boolean) => setCognitiveAlerts({ pomodoroPause: v })}
              disabled={!preferences.cognitiveAlerts.enabled}
            />
          }
        />

        <Separator />

        <Row
          title="Avisos de transição"
          description="Alertas ao trocar de contexto ou atividade"
          right={
            <Switch
              checked={preferences.cognitiveAlerts.transitionWarnings}
              onCheckedChange={(v: boolean) => setCognitiveAlerts({ transitionWarnings: v })}
              disabled={!preferences.cognitiveAlerts.enabled}
            />
          }
        />

        <Separator />

        <View className="py-4">
          <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-sm font-medium text-foreground">Tempo máximo por tarefa</Text>
              <Text className="mt-1 text-xs text-muted-foreground">
                Receba alertas após este período em uma tarefa
              </Text>
            </View>
            <Text className="ml-4 text-sm font-semibold text-foreground">
              {preferences.cognitiveAlerts.taskMaxMinutes} min
            </Text>
          </View>

          <Slider
            containerClassName="w-full"
            minimumValue={10}
            maximumValue={180}
            step={5}
            value={preferences.cognitiveAlerts.taskMaxMinutes}
            onValueChange={(value: number) => {
              const clamped = Math.max(10, Math.min(180, Math.round(value)));
              setCognitiveAlerts({ taskMaxMinutes: clamped });
            }}
            disabled={!preferences.cognitiveAlerts.enabled}
          />
        </View>
      </Card>

      {/* PERFIL COGNITIVO */}
      <SectionTitle>Perfil cognitivo</SectionTitle>
      <Card className="mb-6 p-4">
        <Row
          title="Interface completa"
          description="Mostra todas as opções e controles disponíveis"
          right={
            <Switch
              checked={preferences.uiComplexity === 'normal'}
              onCheckedChange={(v: boolean) => setComplexity(v ? 'normal' : 'minimum')}
            />
          }
        />

        <Separator />

        <Row
          title="Visualização detalhada"
          description="Exibe informações extras em listas e cartões"
          right={
            <Switch
              checked={preferences.detailsMode === 'detailed'}
              onCheckedChange={(v: boolean) => setDetailsMode(v ? 'detailed' : 'summary')}
            />
          }
        />
      </Card>

      {/* PREFERÊNCIAS DO APP */}
      <SectionTitle>Preferências do app</SectionTitle>
      <Card className="mb-6 p-4">
        <Row
          title="Restaurar último workspace"
          description="Continua de onde você parou ao abrir o app"
          right={
            <Switch
              checked={preferences.restoreLastWorkspace}
              onCheckedChange={(v: boolean) => setPreferences({ restoreLastWorkspace: v })}
            />
          }
        />

        <Separator />

        <Row
          title="Lembrar última rota"
          description="Mantém a navegação entre sessões"
          right={
            <Switch
              checked={preferences.rememberLastRoute}
              onCheckedChange={(v: boolean) => setPreferences({ rememberLastRoute: v })}
            />
          }
        />

        <Separator />

        <Row
          title="Confirmar ações destrutivas"
          description="Pede confirmação antes de deletar ou remover"
          right={
            <Switch
              checked={preferences.confirmDestructive}
              onCheckedChange={(v: boolean) => setPreferences({ confirmDestructive: v })}
            />
          }
        />
      </Card>

      {/* CONTA */}
      <SectionTitle>Conta</SectionTitle>
      <Card className="mb-6 p-4">
        <Button variant="destructive" onPress={handleLogout}>
          <Text>Sair da conta</Text>
        </Button>
      </Card>
    </ScrollView>
  );
}
