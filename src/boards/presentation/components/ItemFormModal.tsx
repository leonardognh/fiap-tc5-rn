import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { MenuSelect } from "@/components/ui/menu";
import { User, UserPlus } from "lucide-react-native";
import type { BoardItemPriority, BoardUser, ItemFormInput } from "../../types/boards";
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
  assignees?: BoardUser[];
  currentUser?: { id: string; displayName?: string | null; photoURL?: string | null };
  onClose: () => void;
  onConfirm: (input: ItemFormInput) => void;
};

export function ItemFormModal({
  visible,
  title,
  confirmLabel,
  initial,
  moveOptions,
  assignees,
  currentUser,
  onClose,
  onConfirm,
}: ItemFormModalProps) {
  const { t } = useTranslation();
  const resolvedConfirmLabel = confirmLabel ?? t("common.save");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPriority, setFormPriority] = useState<BoardItemPriority>("medium");
  const [formAssigneeId, setFormAssigneeId] = useState<string | null>(null);
  const [formAssigneeName, setFormAssigneeName] = useState<string | null>(null);
  const [formAssigneePhoto, setFormAssigneePhoto] = useState<string | null>(null);

  const priorityOptions = useMemo(
    () => [
      { value: "low", label: t("boards.priorities.low") },
      { value: "medium", label: t("boards.priorities.medium") },
      { value: "high", label: t("boards.priorities.high") },
      { value: "urgent", label: t("boards.priorities.urgent") },
    ],
    [t],
  );

  useEffect(() => {
    if (!visible) {
      setFormTitle("");
      setFormDescription("");
      setFormPriority("medium");
      setFormAssigneeId(null);
      setFormAssigneeName(null);
      setFormAssigneePhoto(null);
      return;
    }
    setFormTitle(initial?.title ?? "");
    setFormDescription(initial?.description ?? "");
    setFormPriority(initial?.priority ?? "medium");
    setFormAssigneeId(initial?.assignedTo ?? null);
    setFormAssigneeName(initial?.assignedName ?? null);
    setFormAssigneePhoto(initial?.assignedPhotoUrl ?? null);
  }, [
    visible,
    initial?.title,
    initial?.description,
    initial?.priority,
    initial?.assignedTo,
    initial?.assignedName,
    initial?.assignedPhotoUrl,
  ]);

  const canSubmit = useMemo(() => formTitle.trim().length >= 2, [formTitle]);
  const handleAssignToMe = () => {
    if (!currentUser?.id) return;
    setFormAssigneeId(currentUser.id);
    setFormAssigneeName(currentUser.displayName ?? currentUser.id);
    setFormAssigneePhoto(currentUser.photoURL ?? null);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Box className="flex-1 items-center justify-center bg-black/50 px-4">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <Box className="w-full max-w-[520px] rounded-2xl bg-background-0 p-6">
          <VStack space="lg">
            <Heading size="lg" className="text-typography-900">
              {title}
            </Heading>

            <VStack space="md">
              <Input className="border-outline-300 rounded-xl">
                <InputField
                  placeholder={t("boards.itemForm.title_placeholder")}
                  value={formTitle}
                  onChangeText={setFormTitle}
                  maxLength={120}
                />
              </Input>

              <Input className="border-outline-300 rounded-xl min-h-[120px] items-start">
                <InputField
                  placeholder={t("boards.itemForm.description_placeholder")}
                  value={formDescription}
                  onChangeText={setFormDescription}
                  maxLength={500}
                  multiline
                  textAlignVertical="top"
                  numberOfLines={4}
                  className="min-h-[120px] py-2 text-typography-900"
                />
              </Input>

              <VStack space="sm">
                <Text size="sm" className="text-typography-600">
                  {t("boards.itemForm.priority_label")}
                </Text>
                <MenuSelect
                  key={`priority-${visible ? "open" : "closed"}`}
                  value={formPriority}
                  onValueChange={(value) => setFormPriority(value as BoardItemPriority)}
                  options={priorityOptions}
                  placeholder={t("boards.itemForm.priority_placeholder")}
                  size="sm"
                />
              </VStack>

              {assignees && assignees.length > 0 ? (
                <VStack space="sm">
                  <HStack space="sm" className="items-center">
                    <Box className="relative">
                      <Box className="h-12 w-12 items-center justify-center rounded-full border-2 border-emerald-400 bg-transparent">
                        <User size={18} className="text-emerald-400" />
                      </Box>
                      <Box className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-background-0 bg-emerald-400" />
                    </Box>
                    <VStack space="xs">
                      <Text size="xs" className="text-typography-500">
                        {t("boards.itemForm.assigned_to")}
                      </Text>
                      <Text size="sm" className="text-typography-900 font-semibold">
                        {formAssigneeId
                          ? formAssigneeName ?? formAssigneeId
                          : t("boards.itemForm.unassigned")}
                      </Text>
                    </VStack>
                  </HStack>
                  {currentUser?.id ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onPress={handleAssignToMe}
                      className="w-full rounded-xl border-outline-300 bg-transparent"
                    >
                      <ButtonIcon as={UserPlus} className="text-typography-900" />
                      <ButtonText className="text-typography-900">
                        {t("boards.itemForm.assign_to_me")}
                      </ButtonText>
                    </Button>
                  ) : null}
                </VStack>
              ) : null}

              {moveOptions ? (
                <VStack space="sm">
                  <Text size="sm" className="text-typography-600">
                    {t("boards.itemForm.move_to")}
                  </Text>
                  <MenuSelect
                    value={moveOptions.currentColumnId}
                    onValueChange={(value) => {
                      if (value === moveOptions.currentColumnId) return;
                      moveOptions.onMove(value);
                    }}
                    options={moveOptions.columns.map((column) => ({
                      value: column.id,
                      label: column.title,
                      isDisabled: column.id === moveOptions.currentColumnId,
                    }))}
                    isDisabled={moveOptions.disabled}
                    size="sm"
                  />
                </VStack>
              ) : null}
            </VStack>

            <HStack space="sm" className="justify-end">
              <Button variant="outline" onPress={onClose} size="sm">
                <ButtonText>{t("common.cancel")}</ButtonText>
              </Button>
              <Button
                size="sm"
                onPress={() =>
                  onConfirm({
                    title: formTitle.trim(),
                    description: formDescription.trim(),
                    priority: formPriority,
                    assignedTo: formAssigneeId,
                    assignedName: formAssigneeName,
                    assignedPhotoUrl: formAssigneePhoto,
                  })
                }
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