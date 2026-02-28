import { Eye, EyeOff, Pencil } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Image, Modal, Pressable, ScrollView, useWindowDimensions } from "react-native";

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
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <Box
    className={`rounded-2xl border border-outline-200 bg-background-0 p-4 ${className ?? ""}`}
  >
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
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusHelpOpen, setFocusHelpOpen] = useState(false);
  const { width: windowWidth } = useWindowDimensions();
  const focusTooltipWidth = Math.min(220, Math.max(180, windowWidth - 48));
  const useRightTooltip =
    (preferences.fontScale ?? 1) > 1 && (preferences.spaceScale ?? 1) > 1;

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

  const canSavePassword =
    draftPassword.length >= 6 &&
    draftConfirm.length >= 6 &&
    !passwordMismatch;

  const canSaveProfile = useMemo(() => {
    if (!isEditing) return false;
    if (passwordMismatch) return false;
    return true;
  }, [isEditing, passwordMismatch]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setPasswordModalOpen(false);
    setDraftPassword("");
    setDraftConfirm("");
    setShowPassword(false);
    setShowConfirm(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setPasswordModalOpen(false);
    setDraftPassword("");
    setDraftConfirm("");
    setShowPassword(false);
    setShowConfirm(false);
  };

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
    setPasswordModalOpen(false);
    setShowPassword(false);
    setShowConfirm(false);
  };

  const closePasswordModal = () => {
    setPasswordModalOpen(false);
    setDraftPassword("");
    setDraftConfirm("");
    setShowPassword(false);
    setShowConfirm(false);
  };

  const handleSavePassword = async () => {
    if (!canSavePassword) return;
    await updateProfile({
      password: draftPassword,
    });
    closePasswordModal();
  };

  const setTheme = (mode: ThemeMode) => updatePreferences({ theme: mode });

  const setLanguage = (language: UserPreferences["language"]) => {
    updatePreferences({ language });
    i18n.changeLanguage(language);
  };

  const setContrast = (enabled: boolean) => {
    updatePreferences({ contrast: enabled ? "high" : "normal" });
  };

  const focusModeEnabled = preferences.focusMode ?? false;

  const setAnimations = (enabled: boolean) => {
    if (focusModeEnabled) return;
    updatePreferences({ animations: enabled });
  };
  const setTransitionScreen = (enabled: boolean) => {
    if (focusModeEnabled) return;
    updatePreferences({
      cognitiveAlerts: {
        ...preferences.cognitiveAlerts,
        transitionScreen: enabled,
      },
    });
  };
  const setToastAlerts = (enabled: boolean) => {
    if (focusModeEnabled) return;
    updatePreferences({
      cognitiveAlerts: {
        ...preferences.cognitiveAlerts,
        enabled,
      },
    });
  };
  const setFocusMode = (enabled: boolean) => {
    if (enabled) {
      updatePreferences({
        focusMode: true,
        uiComplexity: "minimum",
        detailsMode: "summary",
        animations: false,
        contrast: "normal",
        pomodoroPause: false,
        fontScale: 1,
        spaceScale: 1,
        cognitiveAlerts: {
          ...preferences.cognitiveAlerts,
          enabled: false,
          transitionScreen: false,
          pomodoroPause: false,
        },
      });
      return;
    }

    updatePreferences({ focusMode: false });
  };
  const setPomodoroPause = (enabled: boolean) => {
    if (focusModeEnabled) return;
    updatePreferences({
      cognitiveAlerts: {
        ...preferences.cognitiveAlerts,
        pomodoroPause: enabled,
      },
    });
  };

  const setSpaceScale = (enabled: boolean) => {
    updatePreferences({ spaceScale: enabled ? 1.25 : 1 });
  };

  const setFontScale = (enabled: boolean) => {
    updatePreferences({ fontScale: enabled ? 1.1 : 1 });
  };

  useEffect(() => {
    if (!focusModeEnabled) return;
    if (
      preferences.uiComplexity !== "minimum" ||
      preferences.detailsMode !== "summary" ||
      preferences.animations ||
      preferences.contrast === "high" ||
      (preferences.fontScale ?? 1) !== 1 ||
      (preferences.spaceScale ?? 1) !== 1 ||
      preferences.cognitiveAlerts?.enabled ||
      preferences.cognitiveAlerts?.transitionScreen ||
      preferences.cognitiveAlerts?.pomodoroPause
    ) {
      updatePreferences({
        uiComplexity: "minimum",
        detailsMode: "summary",
        animations: false,
        contrast: "normal",
        fontScale: 1,
        spaceScale: 1,
        pomodoroPause: false,
        cognitiveAlerts: {
          ...preferences.cognitiveAlerts,
          enabled: false,
          transitionScreen: false,
          pomodoroPause: false,
        },
      });
    }
  }, [
    focusModeEnabled,
    preferences.uiComplexity,
    preferences.detailsMode,
    preferences.animations,
    preferences.contrast,
    preferences.fontScale,
    preferences.spaceScale,
    preferences.cognitiveAlerts,
    preferences.cognitiveAlerts?.enabled,
    preferences.cognitiveAlerts?.transitionScreen,
    preferences.cognitiveAlerts?.pomodoroPause,
    updatePreferences,
  ]);

  return (
    <Box className="flex-1 bg-background-0 relative">
      {focusHelpOpen ? (
        <Pressable
          onPress={() => setFocusHelpOpen(false)}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }}
        />
      ) : null}
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
                  variant="link"
                  onPress={handleStartEdit}
                  className="p-0"
                  accessibilityLabel={t("settings.edit")}
                >
                  <ButtonIcon as={Pencil} />
                </Button>
              ) : null}
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

                <Button
                  size="xs"
                  variant="outline"
                  className="self-start"
                  onPress={() => setPasswordModalOpen(true)}
                >
                  <ButtonText>{t("settings.change_password_action")}</ButtonText>
                </Button>

                <HStack space="sm" className="justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={handleCancelEdit}
                  >
                    <ButtonText>{t("settings.cancel")}</ButtonText>
                  </Button>
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

          <Modal visible={passwordModalOpen} transparent animationType="fade">
            <Box className="flex-1 items-center justify-center bg-black/50 px-4">
              <Pressable
                className="absolute inset-0"
                onPress={closePasswordModal}
              />
              <Box className="w-full max-w-[420px] rounded-2xl bg-background-0 p-5">
                <VStack space="md">
                  <Text size="lg" className="text-typography-900 font-semibold">
                    {t("settings.change_password_action")}
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

                  <HStack space="sm" className="justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onPress={closePasswordModal}
                    >
                      <ButtonText>{t("settings.cancel")}</ButtonText>
                    </Button>
                    <Button
                      size="sm"
                      onPress={handleSavePassword}
                      isDisabled={!canSavePassword}
                      className={
                        !canSavePassword ? "bg-background-300" : undefined
                      }
                    >
                      <ButtonText>{t("settings.save")}</ButtonText>
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            </Box>
          </Modal>

          <Box
            className={`relative overflow-visible ${focusHelpOpen ? "z-50" : "z-0"}`}
            style={focusHelpOpen ? { zIndex: 50, elevation: 20 } : undefined}
          >
            <Section title={t("settings.focus_mode")}>
              <HStack space="sm" className="items-center overflow-visible relative">
                <Pressable
                  onPress={() => setFocusMode(!focusModeEnabled)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: focusModeEnabled }}
                >
                  <Box
                    className={`h-5 w-5 items-center justify-center rounded border ${
                      focusModeEnabled
                        ? "bg-primary-600 border-primary-600"
                        : "bg-background-0 border-outline-300"
                    }`}
                  >
                    {focusModeEnabled ? (
                      <Text size="xs" className="text-typography-0 font-semibold">
                        ✓
                      </Text>
                    ) : null}
                  </Box>
                </Pressable>

                <HStack
                  space="xs"
                  className="items-center overflow-visible relative flex-wrap"
                >
                  <Pressable onPress={() => setFocusMode(!focusModeEnabled)}>
                    <Text size="sm" className="text-typography-600 flex-1">
                      {t("settings.focus_mode_label")}
                    </Text>
                  </Pressable>

                  <Box className="relative self-start">
                    <Pressable
                      onPress={() => setFocusHelpOpen((value) => !value)}
                      onHoverIn={() => setFocusHelpOpen(true)}
                      onHoverOut={() => setFocusHelpOpen(false)}
                      accessibilityLabel={t("settings.focus_mode_help_title")}
                    >
                      <Box className="h-4 w-4 items-center justify-center rounded-full border border-outline-300">
                        <Text size="xs" className="text-typography-500 font-semibold">
                          ?
                        </Text>
                      </Box>
                    </Pressable>
                  </Box>
                </HStack>
              </HStack>

              {focusHelpOpen ? (
                <Box
                  className="absolute z-50 rounded-md border border-outline-200 bg-background-0 p-3 shadow-lg"
                  style={{
                    zIndex: 9999,
                    elevation: 20,
                    width: focusTooltipWidth,
                    top: "100%",
                    marginTop: 8,
                    ...(useRightTooltip ? { right: 0 } : { left: 0 }),
                  }}
                >
                  <Text size="xs" className="text-typography-900 font-semibold mb-1">
                    {t("settings.focus_mode_help_title")}
                  </Text>
                  <VStack space="xs">
                    <Text size="xs" className="text-typography-600">
                      • {t("settings.focus_mode_help_1")}
                    </Text>
                    <Text size="xs" className="text-typography-600">
                      • {t("settings.focus_mode_help_2")}
                    </Text>
                    <Text size="xs" className="text-typography-600">
                      • {t("settings.focus_mode_help_3")}
                    </Text>
                    <Text size="xs" className="text-typography-600">
                      • {t("settings.focus_mode_help_4")}
                    </Text>
                     <Text size="xs" className="text-typography-600">
                      • {t("settings.focus_mode_help_5")}
                    </Text>
                     <Text size="xs" className="text-typography-600">
                      • {t("settings.focus_mode_help_6")}
                    </Text>
                  </VStack>
                </Box>
              ) : null}
            </Section>
          </Box>

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

            <VStack space="xs">
              <Text size="sm" className="text-typography-600">
                {t("settings.animations")}
              </Text>
              <Switch
                value={focusModeEnabled ? false : preferences.animations}
                onValueChange={setAnimations}
                disabled={focusModeEnabled}
              />
            </VStack>

            <VStack space="xs">
              <Text size="sm" className="text-typography-600">
                {t("settings.high_contrast")}
              </Text>
              <Switch
                value={
                  focusModeEnabled ? false : preferences.contrast === "high"
                }
                onValueChange={setContrast}
                disabled={focusModeEnabled}
              />
            </VStack>

            <VStack space="xs">
              <Text size="sm" className="text-typography-600">
                {t("settings.spacing_larger")}
              </Text>
              <Switch
                value={focusModeEnabled ? false : (preferences.spaceScale ?? 1) > 1}
                onValueChange={setSpaceScale}
                disabled={focusModeEnabled}
              />
            </VStack>

            <VStack space="xs">
              <Text size="sm" className="text-typography-600">
                {t("settings.font_larger")}
              </Text>
              <Switch
                value={focusModeEnabled ? false : (preferences.fontScale ?? 1) > 1}
                onValueChange={setFontScale}
                disabled={focusModeEnabled}
              />
            </VStack>

          </Section>

          <Section title={t("settings.cognitive_alerts")}>
            <VStack space="xs">
              <Text size="sm" className="text-typography-600">
                {t("settings.toast_alerts")}
              </Text>
              <Switch
                value={
                  focusModeEnabled
                    ? false
                    : preferences.cognitiveAlerts?.enabled ?? true
                }
                onValueChange={setToastAlerts}
                disabled={focusModeEnabled}
              />
            </VStack>

            <VStack space="xs">
                          <Text size="sm" className="text-typography-600">
                            {t("settings.pomodoro")}
                          </Text>
                          <Switch
                            value={
                              focusModeEnabled
                                ? false
                                : preferences.cognitiveAlerts?.pomodoroPause ?? true
                            }
                            onValueChange={setPomodoroPause}
                            disabled={focusModeEnabled}
                          />
            </VStack>

            <VStack space="xs">
              <Text size="sm" className="text-typography-600">
                {t("settings.transition_screen")}
              </Text>
              <Switch
                value={
                  focusModeEnabled
                    ? false
                    : preferences.cognitiveAlerts?.transitionScreen ?? true
                }
                onValueChange={setTransitionScreen}
                disabled={focusModeEnabled}
              />
            </VStack>

          </Section>
        </VStack>
      </ScrollView>
    </Box>
  );
}




