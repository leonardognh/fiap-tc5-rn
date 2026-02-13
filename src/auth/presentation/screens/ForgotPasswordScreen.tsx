import { router } from "expo-router";
import React, { useMemo, useState } from "react";
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
import { ChevronLeft, Mail } from "lucide-react-native";

// Store
import { useAuthStore } from "../../store/auth.store";

export function ForgotPasswordScreen() {
  const { forgotPassword, loading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState("");

  const canSubmit = useMemo(
    () => email.trim().length >= 4 && !loading,
    [email, loading],
  );

  const onSubmit = async () => {
    try {
      await forgotPassword(email);
      Alert.alert(
        "Verifique seu e-mail",
        "Se o endereço informado estiver cadastrado, você receberá um link para redefinir sua senha em instantes.",
        [{ text: "Entendi", onPress: () => router.replace("/login") }],
      );
    } catch {
      // Erro tratado pelo store/showError
    }
  };

  if (error) {
    Alert.alert("Ops", error, [{ text: "OK", onPress: clearError }]);
  }

  return (
    // bg-background-0 adapta-se ao tema light/dark do seu layout
    <Box className="flex-1 bg-background-0 p-6 justify-center">
      <VStack space="xl" className="w-full max-w-[440px] mx-auto">
        {/* Cabeçalho */}
        <VStack space="xs">
          <Heading size="3xl" className="text-typography-900">
            Recuperar senha
          </Heading>
          <Text size="md" className="text-typography-500">
            Digite seu e-mail abaixo para receber as instruções de recuperação.
          </Text>
        </VStack>

        <VStack space="lg" className="mt-4">
          {/* Campo de Email */}
          <VStack space="xs">
            <Text size="sm" bold className="text-typography-700 ml-1">
              E-mail cadastrado
            </Text>
            <Input
              size="md"
              className="border-outline-300 rounded-xl bg-transparent"
            >
              <InputSlot className="pl-3">
                <InputIcon as={Mail} className="text-typography-500" />
              </InputSlot>
              <InputField
                placeholder="exemplo@email.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </Input>
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
              {loading ? "Enviando..." : "Enviar link de recuperação"}
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
                  Voltar para o login
                </ButtonText>
              </HStack>
            </Button>
          </Center>
        </VStack>
      </VStack>
    </Box>
  );
}
