import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";

export default function HomeTab() {
  return (
    <Box>
      <VStack space="md">
        <Text size="xl" bold>
          Home
        </Text>
      </VStack>
    </Box>
  );
}
