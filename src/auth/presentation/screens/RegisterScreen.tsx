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
import { Lock, Mail, User } from "lucide-react-native";

// Store
import { useAuthStore } from "../../store/auth.store";

export function RegisterScreen() {
  const { register, loading, error, clearError } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const canSubmit = useMemo(
    () =>
      name.trim().length >= 2 &&
      email.trim().length >= 4 &&
      password.length >= 6 &&
      !loading,
    [name, email, password, loading],
  );

  const onSubmit = async () => {
    try {
      await register(name, email, password);
      router.replace("/(app)/(tabs)");
    } catch (e) {
      // Erro tratado pelo store
    }
  };

  if (error) {
    Alert.alert("Ops", error, [{ text: "OK", onPress: clearError }]);
  }

  return (
    // bg-background-0 garante que a cor de fundo mude conforme o tema (light/dark)
    <Box className="flex-1 bg-background-0 p-6 justify-center">
      <VStack space="xl" className="w-full max-w-[440px] mx-auto">
        {/* Cabeçalho */}
        <VStack space="xs">
          <Heading size="3xl" className="text-typography-900">
            Criar conta
          </Heading>
          <Text size="md" className="text-typography-500">
            Preencha os dados abaixo para começar
          </Text>
        </VStack>

        <VStack space="lg" className="mt-4">
          {/* Campo de Nome */}
          <VStack space="xs">
            <Text size="sm" bold className="text-typography-700 ml-1">
              Nome completo
            </Text>
            <Input
              size="md"
              className="border-outline-300 rounded-xl bg-transparent"
            >
              <InputSlot className="pl-3">
                <InputIcon as={User} className="text-typography-500" />
              </InputSlot>
              <InputField
                placeholder="Ex: João Silva"
                value={name}
                onChangeText={setName}
              />
            </Input>
          </VStack>

          {/* Campo de Email */}
          <VStack space="xs">
            <Text size="sm" bold className="text-typography-700 ml-1">
              E-mail
            </Text>
            <Input
              size="md"
              className="border-outline-300 rounded-xl bg-transparent"
            >
              <InputSlot className="pl-3">
                <InputIcon as={Mail} className="text-typography-500" />
              </InputSlot>
              <InputField
                placeholder="seu@email.com"
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
              Senha
            </Text>
            <Input
              size="md"
              className="border-outline-300 rounded-xl bg-transparent"
            >
              <InputSlot className="pl-3">
                <InputIcon as={Lock} className="text-typography-500" />
              </InputSlot>
              <InputField
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
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
              {loading ? "Criando conta..." : "Cadastrar agora"}
            </ButtonText>
          </Button>

          <Center>
            <HStack space="xs" className="items-center">
              <Text size="sm" className="text-typography-600">
                Já possui uma conta?
              </Text>
              <Button
                variant="link"
                onPress={() => router.replace("/login")}
                className="p-0 h-auto"
              >
                <ButtonText size="sm" className="text-primary-600 font-bold">
                  Faça login
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
          <ButtonText className="text-typography-400">Voltar</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}
