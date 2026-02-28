import { router } from "expo-router";
import React from "react";
import { Image } from "react-native";
import { useTranslation } from "react-i18next";

import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

export default function IntroPage() {
  const { t } = useTranslation();
  const logoSource = require("@/assets/images/logo.svg");

  return (
    <Box className="flex-1 bg-background-0 p-8 justify-between">
      <Center className="flex-1">
        <Box className="w-24 h-24 rounded-3xl items-center justify-center shadow-lg mb-8 bg-white">
          <Image source={logoSource} style={{ width: 72, height: 72 }} resizeMode="contain" />
        </Box>

        <VStack space="md" className="items-center">
          <Heading size="3xl" className="text-typography-900 text-center">
            {t("app.intro_title")}
          </Heading>
          <Text size="lg" className="text-typography-500 text-center px-4">
            {t("app.intro_subtitle")}
          </Text>
        </VStack>
      </Center>

      <VStack space="lg" className="w-full max-w-[440px] mx-auto pb-8">
        <Button
          size="lg"
          className="bg-typography-900 rounded-xl h-14"
          onPress={() => router.push("/login")}
        >
          <ButtonText className="font-bold text-background-0">
            {t("app.intro_login")}
          </ButtonText>
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="border-typography-900 rounded-xl h-14"
          onPress={() => router.push("/register")}
        >
          <ButtonText className="text-typography-900 font-bold">
            {t("app.intro_register")}
          </ButtonText>
        </Button>

        <Center>
          <Text size="xs" className="text-typography-400 text-center">
            {t("app.intro_rights")}
          </Text>
          <Text size="xs" className="text-typography-400 text-center">
            {t("app.intro_version", { version: "1.1.2" })}
          </Text>
        </Center>
      </VStack>
    </Box>
  );
}