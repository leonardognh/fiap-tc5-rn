import React, { useEffect, useMemo, useState } from "react";
import { Alert, Image, Platform, ScrollView, Switch } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";

import { useAuthStore } from "@/src/auth/store/auth.store";
import { useSettingsStore } from "../../store/settings.store";
import type {
  DetailsMode,
  ThemeMode,
  UiComplexity,
  UserPreferences,
} from "../../types/settings";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box className="rounded-2xl border border-outline-200 bg-background-0 p-4">
    <VStack space="md">
      <Text size="md" className="text-typography-900 font-semibold">
        {title}
      </Text>
      {children}
    </VStack>
  </Box>
);

export function SettingsScreen() {
  const user = useAuthStore((s) => s.user);
  const {
    profile,
    preferences,
    loading,
    error,
    connect,
    updateProfile,
    updatePreferences,
    setFocusMode,
    clearError,
  } = useSettingsStore();

  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftEmail, setDraftEmail] = useState("");
  const [draftPhoto, setDraftPhoto] = useState("");
  const [draftPassword, setDraftPassword] = useState("");
  const [draftConfirm, setDraftConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    return connect(user?.uid ?? null);
  }, [user?.uid, connect]);

  useEffect(() => {
    if (!profile || isEditing) return;
    setDraftName(profile.displayName ?? "");
    setDraftEmail(profile.email ?? "");
    setDraftPhoto(profile.photoURL ?? "");
    setDraftPassword("");
    setDraftConfirm("");
  }, [profile, isEditing]);

  useEffect(() => {
    if (!error) return;
    Alert.alert("Erro", error, [{ text: "OK", onPress: clearError }]);
  }, [error, clearError]);

  const passwordMismatch =
    !!draftPassword && !!draftConfirm && draftPassword !== draftConfirm;

  const canSaveProfile = useMemo(() => {
    if (!isEditing) return false;
    if (passwordMismatch) return false;
    return true;
  }, [isEditing, passwordMismatch]);

  const handleSaveProfile = async () => {
    if (!canSaveProfile) return;
    await updateProfile({
      displayName: draftName.trim() || "Sem nome",
      email: draftEmail.trim() || undefined,
      photoURL: draftPhoto.trim() || undefined,
      password: draftPassword ? draftPassword : undefined,
    });
    setDraftPassword("");
    setDraftConfirm("");
    setIsEditing(false);
    setShowPassword(false);
    setShowConfirm(false);
  };

  const setTheme = (mode: ThemeMode) => updatePreferences({ theme: mode });
  const setLanguage = (language: UserPreferences["language"]) =>
    updatePreferences({ language });
  const setComplexity = (uiComplexity: UiComplexity) =>
    updatePreferences({ uiComplexity });
  const setDetailsMode = (detailsMode: DetailsMode) =>
    updatePreferences({ detailsMode });

  return (
    <Box className="flex-1 bg-background-0">
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 32 }}>
        <VStack space="lg">
          {loading ? (
            <Text className="text-typography-500">Carregando...</Text>
          ) : null}

          <Section title="Perfil">
            <HStack space="md" className="items-center">
              <Image
                source={{ uri: profile?.photoURL || "https://placehold.co/96x96" }}
                style={{ width: 56, height: 56, borderRadius: 12 }}
              />
              <VStack space="xs" className="flex-1">
                <Text className="text-typography-900 font-semibold">
                  {profile?.displayName ?? "Sem nome"}
                </Text>
                <Text size="xs" className="text-typography-500">
                  {profile?.email ?? "email não disponível"}
                </Text>
              </VStack>
              {!isEditing ? (
                <Button size="sm" variant="outline" onPress={() => setIsEditing(true)}>
                  <ButtonText>Editar</ButtonText>
                </Button>
              ) : (
                <Button size="sm" variant="outline" onPress={() => setIsEditing(false)}>
                  <ButtonText>Cancelar</ButtonText>
                </Button>
              )}
            </HStack>

            {isEditing ? (
              <VStack space="sm">
                <Input className="border-outline-300 rounded-xl">
                  <InputField
                    placeholder="Nome"
                    value={draftName}
                    onChangeText={setDraftName}
                  />
                </Input>
                <Input className="border-outline-300 rounded-xl">
                  <InputField
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={draftEmail}
                    onChangeText={setDraftEmail}
                  />
                </Input>
                <Input className="border-outline-300 rounded-xl">
                  <InputField
                    placeholder="URL do avatar"
                    value={draftPhoto}
                    onChangeText={setDraftPhoto}
                  />
                </Input>

                <Text size="sm" className="text-typography-600 mt-2">
                  Alterar senha (opcional)
                </Text>
                <HStack className="items-center">
                  <Input className="border-outline-300 rounded-xl flex-1">
                    <InputField
                      placeholder="Nova senha"
                      secureTextEntry={!showPassword}
                      value={draftPassword}
                      onChangeText={setDraftPassword}
                    />
                  </Input>
                  <Button
                    size="xs"
                    variant="outline"
                    className="ml-2"
                    onPress={() => setShowPassword((v) => !v)}
                  >
                    <ButtonIcon as={showPassword ? EyeOff : Eye} />
                  </Button>
                </HStack>
                <HStack className="items-center">
                  <Input className="border-outline-300 rounded-xl flex-1">
                    <InputField
                      placeholder="Confirmar senha"
                      secureTextEntry={!showConfirm}
                      value={draftConfirm}
                      onChangeText={setDraftConfirm}
                    />
                  </Input>
                  <Button
                    size="xs"
                    variant="outline"
                    className="ml-2"
                    onPress={() => setShowConfirm((v) => !v)}
                  >
                    <ButtonIcon as={showConfirm ? EyeOff : Eye} />
                  </Button>
                </HStack>
                {passwordMismatch ? (
                  <Text size="xs" className="text-error-600">
                    As senhas não coincidem.
                  </Text>
                ) : null}

                <HStack className="justify-end">
                  <Button
                    size="sm"
                    onPress={handleSaveProfile}
                    isDisabled={!canSaveProfile}
                    className={!canSaveProfile ? "bg-background-300" : undefined}
                  >
                    <ButtonText>Salvar</ButtonText>
                  </Button>
                </HStack>
              </VStack>
            ) : null}
          </Section>

          <Section title="Modo foco">
            <VStack space="sm">
              <HStack className="items-center justify-between">
                <Text size="sm" className="text-typography-600">
                  Ativar modo foco
                </Text>
                <Switch
                  value={preferences.focusMode}
                  onValueChange={(v) => setFocusMode(v)}
                />
              </HStack>
              <Text size="xs" className="text-typography-500">
                Quando ativo, reduz animações, simplifica a interface e desativa alertas.
              </Text>
            </VStack>
          </Section>

          <Section title="Aparência">
            <VStack space="sm">
              <Text size="sm" className="text-typography-600">
                Tema
              </Text>
              <HStack space="sm" className="flex-wrap">
                {(["light", "dark", "system"] as ThemeMode[]).map((mode) => {
                  const selected = preferences.theme === mode;
                  return (
                    <Button
                      key={mode}
                      size="xs"
                      variant={selected ? "solid" : "outline"}
                      onPress={() => setTheme(mode)}
                      className={selected ? "bg-primary-600" : undefined}
                    >
                      <ButtonText>
                        {mode === "light"
                          ? "Claro"
                          : mode === "dark"
                            ? "Escuro"
                            : "Sistema"}
                      </ButtonText>
                    </Button>
                  );
                })}
              </HStack>
            </VStack>

            <VStack space="sm">
              <Text size="sm" className="text-typography-600">
                Idioma
              </Text>
              <HStack space="sm" className="flex-wrap">
                {(["pt-BR", "en-US"] as const).map((lang) => {
                  const selected = preferences.language === lang;
                  return (
                    <Button
                      key={lang}
                      size="xs"
                      variant={selected ? "solid" : "outline"}
                      onPress={() => setLanguage(lang)}
                      className={selected ? "bg-primary-600" : undefined}
                    >
                      <ButtonText>{lang === "pt-BR" ? "PT-BR" : "EN-US"}</ButtonText>
                    </Button>
                  );
                })}
              </HStack>
            </VStack>

            <HStack className="items-center justify-between">
              <Text size="sm" className="text-typography-600">
                Animações
              </Text>
              <Switch
                value={preferences.animations}
                onValueChange={(v) => updatePreferences({ animations: v })}
                disabled={preferences.focusMode}
              />
            </HStack>

            <HStack className="items-center justify-between">
              <Text size="sm" className="text-typography-600">
                Alto contraste
              </Text>
              <Switch
                value={preferences.contrast === "high"}
                onValueChange={(v) => updatePreferences({ contrast: v ? "high" : "normal" })}
                disabled={preferences.focusMode}
              />
            </HStack>

            <HStack className="items-center justify-between">
              <Text size="sm" className="text-typography-600">
                Espaçamento amplo
              </Text>
              <Switch
                value={preferences.spaceScale === 2}
                onValueChange={(v) => updatePreferences({ spaceScale: v ? 2 : 1 })}
                disabled={preferences.focusMode}
              />
            </HStack>

            <VStack space="xs">
              <Text size="sm" className="text-typography-600">
                Escala de fonte
              </Text>
              <Input className="border-outline-300 rounded-xl">
                <InputField
                  keyboardType={Platform.OS === "web" ? "default" : "numeric"}
                  value={String(preferences.fontScale)}
                  onChangeText={(value) => {
                    const v = Number(value);
                    if (!Number.isNaN(v)) updatePreferences({ fontScale: v });
                  }}
                  editable={!preferences.focusMode}
                />
              </Input>
            </VStack>
          </Section>

          <Section title="Perfil cognitivo">
            <HStack className="items-center justify-between">
              <Text size="sm" className="text-typography-600">
                Complexidade mínima
              </Text>
              <Switch
                value={preferences.uiComplexity === "minimum"}
                onValueChange={(v) => setComplexity(v ? "minimum" : "normal")}
                disabled={preferences.focusMode}
              />
            </HStack>

            <HStack className="items-center justify-between">
              <Text size="sm" className="text-typography-600">
                Modo resumo
              </Text>
              <Switch
                value={preferences.detailsMode === "summary"}
                onValueChange={(v) => setDetailsMode(v ? "summary" : "detailed")}
                disabled={preferences.focusMode}
              />
            </HStack>
          </Section>

          <Section title="Alertas">
            <HStack className="items-center justify-between">
              <Text size="sm" className="text-typography-600">
                Ativar alertas
              </Text>
              <Switch
                value={preferences.cognitiveAlerts.enabled}
                onValueChange={(v) =>
                  updatePreferences({
                    cognitiveAlerts: { ...preferences.cognitiveAlerts, enabled: v },
                  })
                }
                disabled={preferences.focusMode}
              />
            </HStack>
            <HStack className="items-center justify-between">
              <Text size="sm" className="text-typography-600">
                Pausa pomodoro
              </Text>
              <Switch
                value={preferences.cognitiveAlerts.pomodoroPause}
                onValueChange={(v) =>
                  updatePreferences({
                    cognitiveAlerts: { ...preferences.cognitiveAlerts, pomodoroPause: v },
                  })
                }
                disabled={preferences.focusMode}
              />
            </HStack>
            <HStack className="items-center justify-between">
              <Text size="sm" className="text-typography-600">
                Transições suaves
              </Text>
              <Switch
                value={preferences.cognitiveAlerts.transitionScreen}
                onValueChange={(v) =>
                  updatePreferences({
                    cognitiveAlerts: {
                      ...preferences.cognitiveAlerts,
                      transitionScreen: v,
                    },
                  })
                }
                disabled={preferences.focusMode}
              />
            </HStack>
          </Section>

        </VStack>
      </ScrollView>
    </Box>
  );
}
