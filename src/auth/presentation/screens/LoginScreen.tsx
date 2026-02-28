import { Box } from "@/components/ui/box";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { router } from "expo-router";
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../store/auth.store";
import { useSettingsStore } from "@/src/settings/store/settings.store";

export function LoginScreen() {
  const { login, loading, error, clearError } = useAuthStore();
  const toast = useToast();
  const { t } = useTranslation();
  const toastEnabled = useSettingsStore(
    (s) => s.preferences.cognitiveAlerts?.enabled ?? true,
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit = useMemo(
    () => email.trim().length >= 4 && password.length >= 6 && !loading,
    [email, password, loading],
  );

  const onSubmit = async () => {
    try {
      await login(email, password);
    } catch (e) {
      /* Erro já no store */
    }
  };

  useEffect(() => {
    if (!error) return;
    if (toastEnabled) {
      toast.show({
        placement: "top",
        duration: 3000,
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error" variant="solid">
            <ToastTitle>{t("auth.login_error_title")}</ToastTitle>
            <ToastDescription>{error}</ToastDescription>
          </Toast>
        ),
      });
    }
    clearError();
  }, [error, toast, clearError, toastEnabled, t]);

  return (
    <Box className="flex-1 bg-background-0 p-6 justify-center">
      <VStack space="xl" className="w-full max-w-[440px] mx-auto">
        <VStack space="xs">
          <Heading size="3xl" className="text-typography-900">
            {t("auth.login_title")}
          </Heading>
          <Text size="md" className="text-typography-500">
            {t("auth.login_subtitle")}
          </Text>
        </VStack>

        <VStack space="lg" className="mt-4">
          <VStack space="xs">
            <Text size="sm" bold className="text-typography-700 ml-1">
              {t("auth.email_label")}
            </Text>
            <Input size="md" className="border-outline-300 rounded-xl bg-transparent">
              <InputSlot className="pl-3">
                <InputIcon as={Mail} />
              </InputSlot>
              <InputField
                placeholder={t("auth.email_placeholder")}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </Input>
          </VStack>

          <VStack space="xs">
            <HStack className="justify-between items-center px-1">
              <Text size="sm" bold className="text-typography-700">
                {t("auth.password_label")}
              </Text>
              <Button
                variant="link"
                className="p-0 h-auto"
                onPress={() => router.push("/forgot-password")}
              >
                <ButtonText size="xs" className="text-primary-600">
                  {t("auth.forgot_password")}
                </ButtonText>
              </Button>
            </HStack>
            <Input size="md" className="border-outline-300 rounded-xl bg-transparent">
              <InputSlot className="pl-3">
                <InputIcon as={Lock} />
              </InputSlot>
              <InputField
                placeholder={t("auth.password_placeholder")}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <InputSlot
                className="pr-3"
                onPress={() => setShowPassword((value) => !value)}
                accessibilityLabel={
                  showPassword ? t("auth.hide_password") : t("auth.show_password")
                }
              >
                <InputIcon as={showPassword ? EyeOff : Eye} />
              </InputSlot>
            </Input>
          </VStack>
        </VStack>

        <VStack space="md" className="mt-6">
          <Button
            size="lg"
            onPress={onSubmit}
            isDisabled={!canSubmit}
            className={`rounded-xl ${!canSubmit ? "bg-background-300" : "bg-primary-600"}`}
          >
            {loading && <ButtonSpinner className="mr-2" />}
            <ButtonText className="font-bold">{t("auth.login_button")}</ButtonText>
          </Button>

          <Center>
            <HStack space="xs" className="items-center">
              <Text size="sm" className="text-typography-600">
                {t("auth.no_account")}
              </Text>
              <Button
                variant="link"
                onPress={() => router.push("/register")}
                className="p-0 h-auto"
              >
                <ButtonText size="sm" className="text-primary-600 font-bold">
                  {t("auth.register_link")}
                </ButtonText>
              </Button>
            </HStack>
          </Center>
        </VStack>
      </VStack>
    </Box>
  );
}