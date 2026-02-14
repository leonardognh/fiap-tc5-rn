import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable } from "react-native";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import type { BoardFormInput } from "../../types/boards";

type BoardFormModalProps = {
  visible: boolean;
  title: string;
  confirmLabel?: string;
  initial?: BoardFormInput;
  submitting?: boolean;
  onClose: () => void;
  onConfirm: (input: BoardFormInput) => void;
};

export function BoardFormModal({
  visible,
  title,
  confirmLabel = "Salvar",
  initial,
  submitting,
  onClose,
  onConfirm,
}: BoardFormModalProps) {
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");

  useEffect(() => {
    if (!visible) return;
    setFormTitle(initial?.title ?? "");
    setFormDescription(initial?.description ?? "");
  }, [visible, initial?.title, initial?.description]);

  const canSubmit = useMemo(() => {
    const titleOk = formTitle.trim().length >= 3 && formTitle.trim().length <= 60;
    const descOk = formDescription.trim().length <= 280;
    return titleOk && descOk && !submitting;
  }, [formTitle, formDescription, submitting]);

  const handleConfirm = () => {
    if (!canSubmit) return;
    onConfirm({ title: formTitle.trim(), description: formDescription.trim() });
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Box className="flex-1 items-center justify-center bg-black/50 px-4">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <Box className="w-full max-w-[520px] rounded-2xl bg-background-0 p-5">
          <VStack space="md">
            <VStack space="xs">
              <Heading size="lg" className="text-typography-900">
                {title}
              </Heading>
              <Text size="sm" className="text-typography-500">
                Título obrigatório (3-60 caracteres). Descrição opcional.
              </Text>
            </VStack>

            <VStack space="sm">
              <Input className="border-outline-300 rounded-xl">
                <InputField
                  placeholder="Título do board"
                  value={formTitle}
                  onChangeText={setFormTitle}
                  maxLength={60}
                />
              </Input>

              <Input className="border-outline-300 rounded-xl min-h-[120px] items-start">
                <InputField
                  placeholder="Descrição (opcional)"
                  value={formDescription}
                  onChangeText={setFormDescription}
                  maxLength={280}
                  multiline
                  textAlignVertical="top"
                  numberOfLines={4}
                  className="min-h-[120px] py-2 text-typography-900"
                />
              </Input>
            </VStack>

            <HStack space="sm" className="justify-end">
              <Button variant="outline" onPress={onClose} size="sm">
                <ButtonText>Cancelar</ButtonText>
              </Button>
              <Button
                size="sm"
                onPress={handleConfirm}
                isDisabled={!canSubmit}
                className={!canSubmit ? "bg-background-300" : undefined}
              >
                <ButtonText>{confirmLabel}</ButtonText>
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Box>
    </Modal>
  );
}
