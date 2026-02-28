import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";

import { Box } from "@/components/ui/box";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

import { ChevronLeft, Mail } from "lucide-react-native";

import { useAuthStore } from "../../store/auth.store";

export function ForgotPasswordScreen() {
  const { forgotPassword, loading, error, clearError } = useAuthStore();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");

  const canSubmit = useMemo(
    () => email.trim().length >= 4 && !loading,
    [email, loading],
  );

  const onSubmit = async () => {
    try {
      await forgotPassword(email);
      Alert.alert(
        t("auth.reset_alert_title"),
        t("auth.reset_alert_message"),
        [{ text: t("auth.reset_alert_button"), onPress: () => router.replace("/login") }],
      );
    } catch {
      // Erro tratado pelo store/showError
    }
  };

  if (error) {
    Alert.alert(t("common.oops"), error, [
      { text: t("common.ok"), onPress: clearError },
    ]);
  }

  return (
    <Box className="flex-1 bg-background-0 p-6 justify-center">
      <VStack space="xl" className="w-full max-w-[440px] mx-auto">
        <VStack space="xs">
          <Heading size="3xl" className="text-typography-900">
            {t("auth.reset_title")}
          </Heading>
          <Text size="md" className="text-typography-500">
            {t("auth.reset_subtitle")}
          </Text>
        </VStack>

        <VStack space="lg" className="mt-4">
          <VStack space="xs">
            <Text size="sm" bold className="text-typography-700 ml-1">
              {t("auth.registered_email")}
            </Text>
            <Input size="md" className="border-outline-300 rounded-xl bg-transparent">
              <InputSlot className="pl-3">
                <InputIcon as={Mail} className="text-typography-500" />
              </InputSlot>
              <InputField
                placeholder={t("auth.reset_email_placeholder")}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </Input>
          </VStack>
        </VStack>

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
              {loading ? t("auth.reset_sending") : t("auth.reset_button")}
            </ButtonText>
          </Button>

          <Center>
            <Button
              variant="link"
              onPress={() => router.replace("/login")}
              className="p-0 h-auto"
            >
              <HStack space="xs" className="items-center">
                <ChevronLeft size={16} className="text-primary-600" />
                <ButtonText size="sm" className="text-primary-600 font-bold">
                  {t("auth.back_to_login")}
                </ButtonText>
              </HStack>
            </Button>
          </Center>
        </VStack>
      </VStack>
    </Box>
  );
}