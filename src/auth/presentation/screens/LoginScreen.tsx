import { useMemo, useState } from "react";
import { router } from "expo-router";
import { Alert } from "react-native";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Input, InputField } from "@/components/ui/input";
import { useAuthStore } from "../../store/auth.store";

export function LoginScreen() {
  const { login, loading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const canSubmit = useMemo(
    () => email.trim().length >= 4 && password.length >= 6 && !loading,
    [email, password, loading],
  );

  const onSubmit = async () => {
    try {
      await login(email, password);
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
          Login
        </Text>

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
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </Input>

        <Button onPress={onSubmit} isDisabled={!canSubmit}>
          <ButtonText>{loading ? "Entrando..." : "Entrar"}</ButtonText>
        </Button>

        <Button variant="link" onPress={() => router.push("/forgot-password")}>
          <ButtonText>Esqueci minha senha</ButtonText>
        </Button>

        <Button variant="link" onPress={() => router.push("/register")}>
          <ButtonText>Criar conta</ButtonText>
        </Button>

        <Button variant="link" onPress={() => router.replace("/")}>
          <ButtonText>Voltar</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}
