import React, { useMemo } from "react";
import { Modal, Pressable } from "react-native";
import { useTranslation } from "react-i18next";

import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";

type PomodoroLockModalProps = {
  visible: boolean;
  secondsLeft: number;
  onContinue: () => void;
  onComplete: () => void;
};

const formatTime = (seconds: number) => {
  const total = Math.max(0, Math.floor(seconds));
  const mm = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const ss = Math.floor(total % 60)
    .toString()
    .padStart(2, "0");
  return `${mm}:${ss}`;
};

export function PomodoroLockModal({
  visible,
  secondsLeft,
  onContinue,
  onComplete,
}: PomodoroLockModalProps) {
  const { t } = useTranslation();
  const canAct = useMemo(() => secondsLeft <= 0, [secondsLeft]);
  const label = useMemo(() => formatTime(secondsLeft), [secondsLeft]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Box className="flex-1 items-center justify-center bg-black/50 px-4">
        <Pressable className="absolute inset-0" onPress={() => null} />
        <Box className="w-full max-w-[520px] rounded-2xl bg-background-0 p-5">
          <VStack space="md">
            <VStack space="xs">
              <Heading size="lg" className="text-typography-900">
                {t("boards.pomodoro.breakTitle")}
              </Heading>
              <Text size="sm" className="text-typography-600">
                {t("boards.pomodoro.breakDescription")}
              </Text>
            </VStack>

            <Box className="rounded-xl border border-outline-200 bg-background-50 p-4">
              <HStack className="items-center justify-between">
                <Text size="sm" className="text-typography-600">
                  {t("boards.pomodoro.timeRemaining")}
                </Text>
                <Text size="xl" className="font-bold text-typography-900">
                  {label}
                </Text>
              </HStack>
            </Box>

            <HStack className="flex-wrap justify-end" space="sm">
              <Button
                size="sm"
                variant="outline"
                onPress={onContinue}
                isDisabled={!canAct}
                className={!canAct ? "bg-background-200" : undefined}
              >
                <ButtonText>{t("boards.pomodoro.backToTask")}</ButtonText>
              </Button>
              <Button
                size="sm"
                onPress={onComplete}
                isDisabled={!canAct}
                className={!canAct ? "bg-background-300" : undefined}
              >
                <ButtonText>{t("boards.pomodoro.finishedTask")}</ButtonText>
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Box>
    </Modal>
  );
}
