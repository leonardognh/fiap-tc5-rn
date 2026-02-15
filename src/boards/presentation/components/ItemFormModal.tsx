import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable } from "react-native";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectScrollView,
  SelectTrigger,
} from "@/components/ui/select";
import { ChevronDown } from "lucide-react-native";
import type { ItemFormInput } from "../../types/boards";
import type { BoardColumn } from "../../types/boards";

type ItemFormModalProps = {
  visible: boolean;
  title: string;
  confirmLabel?: string;
  initial?: ItemFormInput;
  moveOptions?: {
    columns: BoardColumn[];
    currentColumnId: string;
    onMove: (columnId: string) => void;
    disabled?: boolean;
  };
  onClose: () => void;
  onConfirm: (input: ItemFormInput) => void;
};

export function ItemFormModal({
  visible,
  title,
  confirmLabel = "Salvar",
  initial,
  moveOptions,
  onClose,
  onConfirm,
}: ItemFormModalProps) {
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");

  useEffect(() => {
    if (!visible) return;
    setFormTitle(initial?.title ?? "");
    setFormDescription(initial?.description ?? "");
  }, [visible, initial?.title, initial?.description]);

  const canSubmit = useMemo(() => formTitle.trim().length >= 2, [formTitle]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Box className="flex-1 items-center justify-center bg-black/50 px-4">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <Box className="w-full max-w-[520px] rounded-2xl bg-background-0 p-5">
          <VStack space="md">
            <Heading size="lg" className="text-typography-900">
              {title}
            </Heading>

            <VStack space="sm">
              <Input className="border-outline-300 rounded-xl">
                <InputField
                  placeholder="Título do item"
                  value={formTitle}
                  onChangeText={setFormTitle}
                  maxLength={120}
                />
              </Input>

              <Input className="border-outline-300 rounded-xl min-h-[120px] items-start">
                <InputField
                  placeholder="Descrição (opcional)"
                  value={formDescription}
                  onChangeText={setFormDescription}
                  maxLength={500}
                  multiline
                  textAlignVertical="top"
                  numberOfLines={4}
                  className="min-h-[120px] py-2 text-typography-900"
                />
              </Input>

              {moveOptions ? (
                <Select
                  onValueChange={(value) => {
                    if (value === moveOptions.currentColumnId) return;
                    moveOptions.onMove(value);
                  }}
                  isDisabled={moveOptions.disabled}
                  initialLabel="Mover para"
                >
                  <SelectTrigger
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-outline-300 w-full"
                  >
                    <SelectInput placeholder="Mover para" />
                    <SelectIcon as={ChevronDown} className="mr-2 text-typography-500" />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      <SelectScrollView className="max-h-[320px]">
                        {moveOptions.columns.map((column) => (
                          <SelectItem
                            key={column.id}
                            label={column.title}
                            value={column.id}
                            isDisabled={column.id === moveOptions.currentColumnId}
                          />
                        ))}
                      </SelectScrollView>
                    </SelectContent>
                  </SelectPortal>
                </Select>
              ) : null}
            </VStack>

            <HStack space="sm" className="justify-end">
              <Button variant="outline" onPress={onClose} size="sm">
                <ButtonText>Cancelar</ButtonText>
              </Button>
              <Button
                size="sm"
                onPress={() => onConfirm({
                  title: formTitle.trim(),
                  description: formDescription.trim(),
                })}
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
