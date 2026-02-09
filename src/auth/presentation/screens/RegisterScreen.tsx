import { useMemo, useState } from "react";
import { router } from "expo-router";
import { Alert } from "react-native";
import { useAuthStore } from "../../store/auth.store";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Input, InputField } from "@/components/ui/input";

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
    } catch {
      // erro
    }
  };

  const showError = () => {
    if (!error) return null;
    Alert.alert("Ops", error, [{ text: "OK", onPress: clearError }]);
    return null;
  };

  return (
    <Box>
      {showError()}
      <VStack space="md">
        <Text size="xl" bold>
          Criar conta
        </Text>

        <Input>
          <InputField placeholder="Nome" value={name} onChangeText={setName} />
        </Input>

        <Input>
          <InputField
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </Input>

        <Input>
          <InputField
            placeholder="Senha (mín. 6)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </Input>

        <Button onPress={onSubmit} isDisabled={!canSubmit}>
          <ButtonText>{loading ? "Criando..." : "Cadastrar"}</ButtonText>
        </Button>

        <Button variant="link" onPress={() => router.replace("/login")}>
          <ButtonText>Já tenho conta</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}
