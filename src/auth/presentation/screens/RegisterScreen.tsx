import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";

// Gluestack UI Components
import { Box } from "@/components/ui/box";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

// Icons
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react-native";

// Store
import { useAuthStore } from "../../store/auth.store";

export function RegisterScreen() {
  const { register, loading, error, clearError } = useAuthStore();
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;
  const showPasswordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  const canSubmit = useMemo(
    () =>
      name.trim().length >= 2 &&
      email.trim().length >= 4 &&
      password.length >= 6 &&
      confirmPassword.length >= 6 &&
      password === confirmPassword &&
      !loading,
    [name, email, password, confirmPassword, loading],
  );

  const onSubmit = async () => {
    try {
      if (!passwordsMatch) {
        Alert.alert(t("common.oops"), t("auth.password_mismatch"), [{ text: t("common.ok") }]);
        return;
      }
      await register(name, email, password);
      router.replace("/(app)/(tabs)");
    } catch (e) {
      // Erro tratado pelo store
    }
  };

  if (error) {
    Alert.alert(t("common.oops"), error, [{ text: t("common.ok"), onPress: clearError }]);
  }

  return (
    // bg-background-0 garante que a cor de fundo mude conforme o tema (light/dark)
    <Box className="flex-1 bg-background-0 p-6 justify-center">
      <VStack space="xl" className="w-full max-w-[440px] mx-auto">
        {/* Cabeçalho */}
        <VStack space="xs">
          <Heading size="3xl" className="text-typography-900">
            {t("auth.register_title")}
          </Heading>
          <Text size="md" className="text-typography-500">
            {t("auth.register_subtitle")}
          </Text>
        </VStack>

        <VStack space="lg" className="mt-4">
          {/* Campo de Nome */}
          <VStack space="xs">
            <Text size="sm" bold className="text-typography-700 ml-1">
              {t("auth.full_name")}
            </Text>
            <Input
              size="md"
              className="border-outline-300 rounded-xl bg-transparent"
            >
              <InputSlot className="pl-3">
                <InputIcon as={User} className="text-typography-500" />
              </InputSlot>
              <InputField
                placeholder={t("auth.name_placeholder")}
                value={name}
                onChangeText={setName}
              />
            </Input>
          </VStack>

          {/* Campo de Email */}
          <VStack space="xs">
            <Text size="sm" bold className="text-typography-700 ml-1">
              {t("auth.email_label")}
            </Text>
            <Input
              size="md"
              className="border-outline-300 rounded-xl bg-transparent"
            >
              <InputSlot className="pl-3">
                <InputIcon as={Mail} className="text-typography-500" />
              </InputSlot>
              <InputField
                placeholder={t("auth.email_placeholder")}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </Input>
          </VStack>

          {/* Campo de Senha */}
          <VStack space="xs">
            <Text size="sm" bold className="text-typography-700 ml-1">
              {t("auth.password_label")}
            </Text>
            <Input
              size="md"
              className={`rounded-xl bg-transparent ${
                showPasswordMismatch ? "border-error-500" : "border-outline-300"
              }`}
            >
              <InputSlot className="pl-3">
                <InputIcon as={Lock} className="text-typography-500" />
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

          {/* Campo de Confirmar Senha */}
          <VStack space="xs">
            <Text size="sm" bold className="text-typography-700 ml-1">
              {t("auth.confirm_password")}
            </Text>
            <Input
              size="md"
              className={`rounded-xl bg-transparent ${
                showPasswordMismatch ? "border-error-500" : "border-outline-300"
              }`}
            >
              <InputSlot className="pl-3">
                <InputIcon as={Lock} className="text-typography-500" />
              </InputSlot>
              <InputField
                placeholder={t("auth.confirm_password_placeholder")}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <InputSlot
                className="pr-3"
                onPress={() =>
                  setShowConfirmPassword((value) => !value)
                }
                accessibilityLabel={
                  showConfirmPassword
                    ? t("auth.hide_password")
                    : t("auth.show_password")
                }
              >
                <InputIcon as={showConfirmPassword ? EyeOff : Eye} />
              </InputSlot>
            </Input>
            {showPasswordMismatch ? (
              <Text size="xs" className="text-error-600 ml-1">
                {t("auth.password_mismatch")}
              </Text>
            ) : null}
          </VStack>
        </VStack>

        {/* Ações */}
        <VStack space="md" className="mt-6">
          <Button
            size="lg"
            onPress={onSubmit}
            isDisabled={!canSubmit}
            className={`rounded-xl shadow-sm ${
              !canSubmit ? "bg-background-300" : "bg-primary-600"
            }`}
          >
            {loading && <ButtonSpinner className="mr-2" />}
            <ButtonText className="font-bold">
              {loading ? t("auth.creating_account") : t("auth.register_button")}
            </ButtonText>
          </Button>

          <Center>
            <HStack space="xs" className="items-center">
              <Text size="sm" className="text-typography-600">
                {t("auth.already_have_account")}
              </Text>
              <Button
                variant="link"
                onPress={() => router.replace("/login")}
                className="p-0 h-auto"
              >
                <ButtonText size="sm" className="text-primary-600 font-bold">
                  {t("auth.login_link")}
                </ButtonText>
              </Button>
            </HStack>
          </Center>
        </VStack>

        {/* Botão Voltar */}
        <Button
          variant="outline"
          action="secondary"
          className="mt-8 border-none"
          onPress={() => router.replace("/")}
        >
          <ButtonText className="text-typography-400">{t("common.back")}</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}
