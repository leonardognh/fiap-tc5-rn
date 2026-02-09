import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { router } from "expo-router";

export default function IntroPage() {
  return (
    <Box>
      <VStack space="lg">
        <Text size="2xl" bold>
          Bem-vindo
        </Text>

        <Text>Apresentação do app. Texto curto, direto, e sem enrolar.</Text>

        <Button onPress={() => router.push("/login")}>
          <ButtonText>Fazer login</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}
