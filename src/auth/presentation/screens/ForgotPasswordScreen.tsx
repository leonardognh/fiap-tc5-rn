import { useMemo, useState } from "react";
import { router } from "expo-router";
import { Alert } from "react-native";
import { useAuthStore } from "../../store/auth.store";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

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
        "Pronto",
        "Se o email existir, você receberá um link para redefinir a senha.",
      );
      router.replace("/login");
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
          Recuperar senha
        </Text>

        <Text>Informe seu email. Se existir, o Firebase manda o link.</Text>

        <Input>
          <InputField
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </Input>

        <Button onPress={onSubmit} isDisabled={!canSubmit}>
          <ButtonText>{loading ? "Enviando..." : "Enviar link"}</ButtonText>
        </Button>

        <Button variant="link" onPress={() => router.replace("/login")}>
          <ButtonText>Voltar</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}
