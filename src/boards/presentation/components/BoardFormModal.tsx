import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable } from "react-native";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { TagsMultiSelect } from "./TagsMultiSelect";
import { ColumnsMultiSelect } from "./ColumnsMultiSelect";
import { listTagsByIds } from "../../data/tags.repository";
import type { BoardColumn, BoardFormInput, Tag } from "../../types/boards";

type BoardFormModalProps = {
  visible: boolean;
  title: string;
  confirmLabel?: string;
  initial?: BoardFormInput;
  columns?: BoardColumn[];
  submitting?: boolean;
  onClose: () => void;
  onConfirm: (input: BoardFormInput) => void;
};

export function BoardFormModal({
  visible,
  title,
  confirmLabel = "Salvar",
  initial,
  columns = [],
  submitting,
  onClose,
  onConfirm,
}: BoardFormModalProps) {
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [notStartedColumnIds, setNotStartedColumnIds] = useState<string[]>([]);
  const [doneColumnIds, setDoneColumnIds] = useState<string[]>([]);

  useEffect(() => {
    if (!visible) {
      setFormTitle("");
      setFormDescription("");
      setSelectedTags([]);
      setNotStartedColumnIds([]);
      setDoneColumnIds([]);
      return;
    }
    setFormTitle(initial?.title ?? "");
    setFormDescription(initial?.description ?? "");
    setNotStartedColumnIds(initial?.notStartedColumnIds ?? []);
    setDoneColumnIds(initial?.doneColumnIds ?? []);
    const initialTags = initial?.tags ?? [];
    const initialIds = initial?.tagIds ?? [];

    if (initialTags.length > 0) {
      setSelectedTags(initialTags);
      return;
    }

    if (initialIds.length > 0) {
      let cancelled = false;
      listTagsByIds(initialIds)
        .then((tags) => {
          if (cancelled) return;
          const tagsMap = new Map(tags.map((tag) => [tag.id, tag]));
          const filled = initialIds.map(
            (id) => tagsMap.get(id) ?? { id, name: id },
          );
          setSelectedTags(filled);
        })
        .catch(() => {
          if (!cancelled) {
            setSelectedTags(initialIds.map((id) => ({ id, name: id })));
          }
        });
      return () => {
        cancelled = true;
      };
    }

    setSelectedTags([]);
  }, [
    visible,
    initial?.title,
    initial?.description,
    initial?.tags,
    initial?.tagIds,
    initial?.notStartedColumnIds,
    initial?.doneColumnIds,
  ]);

  useEffect(() => {
    if (!columns.length) return;
    const columnIds = new Set(columns.map((col) => col.id));
    setNotStartedColumnIds((current) => current.filter((id) => columnIds.has(id)));
    setDoneColumnIds((current) => current.filter((id) => columnIds.has(id)));
  }, [columns]);

  const canSubmit = useMemo(() => {
    const titleOk = formTitle.trim().length >= 3 && formTitle.trim().length <= 60;
    const descOk = formDescription.trim().length <= 280;
    return titleOk && descOk && !submitting;
  }, [formTitle, formDescription, submitting]);

  const handleNotStartedChange = (next: string[]) => {
    const filtered = next.filter((id) => !doneColumnIds.includes(id));
    setNotStartedColumnIds(filtered);
    if (filtered.length !== next.length) {
      setDoneColumnIds((current) => current.filter((id) => !filtered.includes(id)));
    }
  };

  const handleDoneChange = (next: string[]) => {
    const filtered = next.filter((id) => !notStartedColumnIds.includes(id));
    setDoneColumnIds(filtered);
    if (filtered.length !== next.length) {
      setNotStartedColumnIds((current) => current.filter((id) => !filtered.includes(id)));
    }
  };

  const handleConfirm = () => {
    if (!canSubmit) return;
    onConfirm({
      title: formTitle.trim(),
      description: formDescription.trim(),
      tagIds: selectedTags.map((tag) => tag.id).filter(Boolean),
      tags: selectedTags,
      notStartedColumnIds,
      doneColumnIds,
    });
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

              {columns.length > 0 ? (
                <>
                  <ColumnsMultiSelect
                    label="Não iniciadas"
                    value={notStartedColumnIds}
                    options={columns}
                    onChange={handleNotStartedChange}
                    disabled={!!submitting}
                    placeholder="Selecione colunas"
                  />
                  <ColumnsMultiSelect
                    label="Done"
                    value={doneColumnIds}
                    options={columns}
                    onChange={handleDoneChange}
                    disabled={!!submitting}
                    placeholder="Selecione colunas"
                  />
                </>
              ) : null}

              <TagsMultiSelect
                value={selectedTags}
                onChange={setSelectedTags}
                disabled={!!submitting}
              />
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
