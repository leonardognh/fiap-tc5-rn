import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";

type ColumnFormModalProps = {
  visible: boolean;
  title: string;
  initialTitle?: string;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: (title: string) => void;
};

export function ColumnFormModal({
  visible,
  title,
  initialTitle,
  confirmLabel,
  onClose,
  onConfirm,
}: ColumnFormModalProps) {
  const { t } = useTranslation();
  const resolvedConfirmLabel = confirmLabel ?? t("common.save");
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!visible) return;
    setValue(initialTitle ?? "");
  }, [visible, initialTitle]);

  const canSubmit = useMemo(() => value.trim().length >= 2, [value]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Box className="flex-1 items-center justify-center bg-black/50 px-4">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <Box className="w-full max-w-[440px] rounded-2xl bg-background-0 p-5">
          <VStack space="md">
            <Heading size="lg" className="text-typography-900">
              {title}
            </Heading>

            <Input className="border-outline-300 rounded-xl">
              <InputField
                placeholder={t("boards.columnForm.title_placeholder")}
                value={value}
                onChangeText={setValue}
                maxLength={60}
              />
            </Input>

            <HStack space="sm" className="justify-end">
              <Button variant="outline" onPress={onClose} size="sm">
                <ButtonText>{t("common.cancel")}</ButtonText>
              </Button>
              <Button
                size="sm"
                onPress={() => onConfirm(value.trim())}
                isDisabled={!canSubmit}
                className={!canSubmit ? "bg-background-300" : undefined}
              >
                <ButtonText>{resolvedConfirmLabel}</ButtonText>
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Box>
    </Modal>
  );
}