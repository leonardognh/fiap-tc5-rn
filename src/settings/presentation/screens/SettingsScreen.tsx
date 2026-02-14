import { Eye, EyeOff } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Image, ScrollView } from "react-native";

import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Switch } from '@/components/ui/switch';

import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

import { useAuthStore } from "@/src/auth/store/auth.store";
import { useSettingsStore } from "../../store/settings.store";
import type { ThemeMode, UserPreferences } from "../../types/settings";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
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
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const {
    profile,
    preferences,
    loading,
    error,
    connect,
    updateProfile,
    updatePreferences,
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
    Alert.alert(t("settings.errors.title"), error, [
      { text: "OK", onPress: clearError },
    ]);
  }, [error, clearError, t]);

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
      displayName: draftName.trim() || t("settings.no_name"),
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

  const setLanguage = (language: UserPreferences["language"]) => {
    updatePreferences({ language });
    i18n.changeLanguage(language);
  };

  const setAnimations = (enabled: boolean) =>
    updatePreferences({ animations: enabled });

  return (
    <Box className="flex-1 bg-background-0">
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 32 }}>
        <VStack space="lg">
          {loading ? (
            <Text className="text-typography-500">{t("settings.loading")}</Text>
          ) : null}

          <Section title={t("settings.profile")}>
            <HStack space="md" className="items-center">
              <Image
                source={{
                  uri: profile?.photoURL || "https://placehold.co/96x96",
                }}
                style={{ width: 56, height: 56, borderRadius: 12 }}
              />
              <VStack space="xs" className="flex-1">
                <Text className="text-typography-900 font-semibold">
                  {profile?.displayName ?? t("settings.no_name")}
                </Text>
                <Text size="xs" className="text-typography-500">
                  {profile?.email ?? t("settings.email_unavailable")}
                </Text>
              </VStack>
              {!isEditing ? (
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => setIsEditing(true)}
                >
                  <ButtonText>{t("settings.edit")}</ButtonText>
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => setIsEditing(false)}
                >
                  <ButtonText>{t("settings.cancel")}</ButtonText>
                </Button>
              )}
            </HStack>

            {isEditing ? (
              <VStack space="sm">
                <Input className="border-outline-300 rounded-xl">
                  <InputField
                    placeholder={t("settings.placeholder_name")}
                    value={draftName}
                    onChangeText={setDraftName}
                  />
                </Input>
                <Input className="border-outline-300 rounded-xl">
                  <InputField
                    placeholder={t("settings.placeholder_email")}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={draftEmail}
                    onChangeText={setDraftEmail}
                  />
                </Input>
                <Input className="border-outline-300 rounded-xl">
                  <InputField
                    placeholder={t("settings.placeholder_avatar")}
                    value={draftPhoto}
                    onChangeText={setDraftPhoto}
                  />
                </Input>

                <Text size="sm" className="text-typography-600 mt-2">
                  {t("settings.change_password")}
                </Text>
                <HStack className="items-center">
                  <Input className="border-outline-300 rounded-xl flex-1">
                    <InputField
                      placeholder={t("settings.new_password")}
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
                      placeholder={t("settings.confirm_password")}
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
                    {t("settings.password_mismatch")}
                  </Text>
                ) : null}

                <HStack className="justify-end">
                  <Button
                    size="sm"
                    onPress={handleSaveProfile}
                    isDisabled={!canSaveProfile}
                    className={
                      !canSaveProfile ? "bg-background-300" : undefined
                    }
                  >
                    <ButtonText>{t("settings.save")}</ButtonText>
                  </Button>
                </HStack>
              </VStack>
            ) : null}
          </Section>

          <Section title={t("settings.appearance")}>
            <VStack space="sm">
              <Text size="sm" className="text-typography-600">
                {t("settings.theme")}
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
                      <ButtonText>{t(`settings.themes.${mode}`)}</ButtonText>
                    </Button>
                  );
                })}
              </HStack>
            </VStack>

            <VStack space="sm">
              <HStack className="items-center justify-between">
                <Text size="sm" className="text-typography-600">
                  {t("settings.animations")}
                </Text>
                <Switch
                  value={preferences.animations}
                  onValueChange={setAnimations}
                />
              </HStack>
              <Text size="xs" className="text-typography-500">
                {t("settings.animations_hint")}
              </Text>
            </VStack>

            <VStack space="sm">
              <Text size="sm" className="text-typography-600">
                {t("settings.language")}
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
                      <ButtonText>
                        {lang === "pt-BR" ? "PT-BR" : "EN-US"}
                      </ButtonText>
                    </Button>
                  );
                })}
              </HStack>
            </VStack>
          </Section>
        </VStack>
      </ScrollView>
    </Box>
  );
}
