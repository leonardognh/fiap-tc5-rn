import React, { useEffect, useMemo, useState } from "react";
import { Alert, Modal, Pressable } from "react-native";
import { DraxList, DraxListItem, DraxProvider } from "react-native-drax";
import { router, useLocalSearchParams } from "expo-router";
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react-native";

import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";

import { useBoardViewStore } from "../../store/board-view.store";
import type { BoardColumn, BoardItem } from "../../types/boards";
import { ColumnFormModal } from "../components/ColumnFormModal";
import { ItemFormModal } from "../components/ItemFormModal";

export function BoardScreen() {
  const params = useLocalSearchParams<{ boardId?: string }>();
  const boardId = Array.isArray(params.boardId)
    ? params.boardId[0]
    : params.boardId;

  const {
    board,
    columns,
    items,
    loading,
    error,
    connect,
    createColumn,
    updateColumn,
    deleteColumn,
    createItem,
    updateItem,
    deleteItem,
    moveItem,
    reorderColumns,
  } = useBoardViewStore();

  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [editingColumn, setEditingColumn] = useState<BoardColumn | null>(null);
  const [creatingItemFor, setCreatingItemFor] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<BoardItem | null>(null);
  const [expandedLines, setExpandedLines] = useState<string[]>([]);
  const [orderedColumns, setOrderedColumns] = useState<BoardColumn[]>([]);
  const [moveTarget, setMoveTarget] = useState<
    { itemId: string; fromColumnId: string } | null
  >(null);

  useEffect(() => {
    if (!boardId) return;
    return connect(boardId);
  }, [boardId, connect]);

  useEffect(() => {
    setOrderedColumns(columns);
  }, [columns]);

  const readOnly = board?.status === "archived";

  const itemsByColumn = useMemo(() => {
    const map = new Map<string, BoardItem[]>();
    items.forEach((item) => {
      const arr = map.get(item.columnId) ?? [];
      arr.push(item);
      map.set(item.columnId, arr);
    });
    return map;
  }, [items]);

  const toggleLine = (columnId: string) => {
    setExpandedLines((current) =>
      current.includes(columnId)
        ? current.filter((id) => id !== columnId)
        : [...current, columnId],
    );
  };

  const handleMoveTo = async (toColumnId: string) => {
    if (!moveTarget) return;
    await moveItem(moveTarget.itemId, toColumnId);
    setMoveTarget(null);
  };

  const handleReorderLines = async (ordered: BoardColumn[]) => {
    if (readOnly) return;
    await reorderColumns(ordered.map((col) => col.id));
  };

  const confirmDeleteColumn = (column: BoardColumn) => {
    Alert.alert(
      "Remover linha",
      `Deseja remover a linha "${column.title}"? Itens serão apagados.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Remover", style: "destructive", onPress: () => deleteColumn(column.id) },
      ],
    );
  };

  const confirmDeleteItem = (item: BoardItem) => {
    Alert.alert("Remover item", `Deseja remover "${item.title}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Remover", style: "destructive", onPress: () => deleteItem(item.id) },
    ]);
  };

  const handleAddColumn = async () => {
    if (!newColumnTitle.trim()) return;
    await createColumn(newColumnTitle);
    setNewColumnTitle("");
  };

  if (!boardId) {
    return (
      <Box className="flex-1 bg-background-0 items-center justify-center">
        <Text className="text-typography-600">Board não encontrado.</Text>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background-0">
      <VStack space="md" className="p-6">
        <HStack className="items-center justify-between">
          <HStack space="sm" className="items-center">
            <Button
              size="xs"
              variant="outline"
              onPress={() => router.back()}
              accessibilityLabel="Voltar"
            >
              <ButtonIcon as={ChevronLeft} />
            </Button>
            <VStack space="xs">
              <Heading size="lg" className="text-typography-900">
                {board?.title ?? "Board"}
              </Heading>
              <Text size="xs" className="text-typography-500">
                {board?.status === "archived" ? "Arquivado" : "Ativo"}
              </Text>
            </VStack>
          </HStack>

          {readOnly ? (
            <Box className="rounded-full bg-background-200 px-3 py-1">
              <Text size="xs" className="text-typography-600">
                Somente leitura
              </Text>
            </Box>
          ) : null}
        </HStack>

        {error ? (
          <Box className="rounded-xl border border-error-200 bg-error-50 p-3">
            <Text size="sm" className="text-error-600">
              {error}
            </Text>
          </Box>
        ) : null}

        <HStack space="sm" className="items-center">
          <Input className="border-outline-300 rounded-xl flex-1">
            <InputField
              placeholder="Nova linha"
              value={newColumnTitle}
              onChangeText={setNewColumnTitle}
              editable={!readOnly}
            />
          </Input>
          <Button
            size="sm"
            onPress={handleAddColumn}
            isDisabled={readOnly || !newColumnTitle.trim()}
            className={readOnly ? "bg-background-300" : undefined}
          >
            <ButtonIcon as={Plus} />
          </Button>
        </HStack>

        {loading && columns.length === 0 ? (
          <Text className="text-typography-500">Carregando...</Text>
        ) : null}

        <DraxProvider>
          <DraxList
            data={orderedColumns}
            keyExtractor={(column) => column.id}
            contentContainerStyle={{ paddingBottom: 32 }}
            longPressDelay={150}
            reorderable={!readOnly}
            onItemReorder={({ fromIndex, toIndex }) => {
              if (readOnly || fromIndex === toIndex) return;
              setOrderedColumns((prev) => {
                const updated = [...prev];
                const [moved] = updated.splice(fromIndex, 1);
                updated.splice(toIndex, 0, moved);
                handleReorderLines(updated);
                return updated;
              });
            }}
            renderItem={(info, itemProps) => {
              const column = info.item;
              const columnItems = itemsByColumn.get(column.id) ?? [];
              const expanded = expandedLines.includes(column.id);
              const countLabel = columnItems.length === 1 ? "item" : "itens";
              return (
                <DraxListItem
                  itemProps={itemProps}
                  draggable={!readOnly}
                  style={{ marginBottom: 16 }}
                  animateSnap={false}
                  snapDelay={0}
                  snapDuration={0}
                  draggingStyle={{ opacity: 0 }}
                  dragReleasedStyle={{ opacity: 1 }}
                  hoverStyle={{ opacity: 1 }}
                  hoverDraggingStyle={{ opacity: 1 }}
                  hoverDragReleasedStyle={{ opacity: 0 }}
                >
                  <Box
                    className="rounded-2xl border border-outline-200 bg-background-50 p-4"
                  >
                    <HStack className="items-center justify-between">
                      <Pressable onPress={() => toggleLine(column.id)} style={{ flex: 1 }}>
                        <VStack space="xs">
                          <Text size="md" className="font-semibold text-typography-900">
                            {column.title}
                          </Text>
                          <Text size="xs" className="text-typography-500">
                            {columnItems.length} {countLabel}
                          </Text>
                        </VStack>
                      </Pressable>
                      <HStack space="xs" className="items-center">
                        {!readOnly ? (
                          <>
                            <Button
                              size="xs"
                              variant="link"
                              onPress={() => setEditingColumn(column)}
                            >
                              <ButtonIcon as={Pencil} />
                            </Button>
                            <Button
                              size="xs"
                              variant="link"
                              action="negative"
                              onPress={() => confirmDeleteColumn(column)}
                            >
                              <ButtonIcon as={Trash2} />
                            </Button>
                          </>
                        ) : null}
                        <Pressable onPress={() => toggleLine(column.id)} hitSlop={8}>
                          <Box className="rounded-full border border-outline-200 bg-background-0 p-2">
                            {expanded ? (
                              <ChevronUp size={16} color="#475569" />
                            ) : (
                              <ChevronDown size={16} color="#475569" />
                            )}
                          </Box>
                        </Pressable>
                      </HStack>
                    </HStack>

                    {expanded ? (
                      <VStack space="sm" className="mt-3">
                        {columnItems.length === 0 ? (
                          <Text size="xs" className="text-typography-500">
                            Sem itens nesta linha.
                          </Text>
                        ) : null}

                        {columnItems.map((task) => (
                          <Box
                            key={task.id}
                            className="rounded-xl border border-outline-200 bg-background-0 p-3"
                          >
                            <VStack space="xs">
                              <Text size="sm" className="font-semibold text-typography-900">
                                {task.title}
                              </Text>
                              {task.description ? (
                                <Text size="xs" className="text-typography-600">
                                  {task.description}
                                </Text>
                              ) : null}
                              {!readOnly ? (
                                <HStack space="xs" className="flex-wrap">
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    onPress={() =>
                                      setMoveTarget({
                                        itemId: task.id,
                                        fromColumnId: column.id,
                                      })
                                    }
                                  >
                                    <ButtonText>Mover para</ButtonText>
                                  </Button>
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    onPress={() => setEditingItem(task)}
                                  >
                                    <ButtonText>Editar</ButtonText>
                                  </Button>
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    action="negative"
                                    onPress={() => confirmDeleteItem(task)}
                                  >
                                    <ButtonText>Remover</ButtonText>
                                  </Button>
                                </HStack>
                              ) : null}
                            </VStack>
                          </Box>
                        ))}

                        {!readOnly ? (
                          <Button
                            size="xs"
                            variant="outline"
                            onPress={() => setCreatingItemFor(column.id)}
                          >
                            <ButtonIcon as={Plus} />
                            <ButtonText>Novo item</ButtonText>
                          </Button>
                        ) : null}
                      </VStack>
                    ) : null}
                  </Box>
                </DraxListItem>
              );
            }}
          />
        </DraxProvider>
      </VStack>

      <Modal visible={!!moveTarget} transparent animationType="fade">
        <Box className="flex-1 items-center justify-center bg-black/50 px-4">
          <Pressable className="absolute inset-0" onPress={() => setMoveTarget(null)} />
          <Box className="w-full max-w-[520px] rounded-2xl bg-background-0 p-5">
            <VStack space="md">
              <Heading size="lg" className="text-typography-900">
                Mover item
              </Heading>
              <Text size="sm" className="text-typography-500">
                Selecione a linha de destino
              </Text>
              <VStack space="sm">
                {columns.map((column) => {
                  const count = itemsByColumn.get(column.id)?.length ?? 0;
                  const disabled = column.id === moveTarget?.fromColumnId;
                  return (
                    <Button
                      key={column.id}
                      size="sm"
                      variant="outline"
                      isDisabled={disabled}
                      className={disabled ? "bg-background-200" : undefined}
                      onPress={() => handleMoveTo(column.id)}
                    >
                      <HStack className="items-center justify-between flex-1">
                        <ButtonText>{column.title}</ButtonText>
                        <Text size="xs" className="text-typography-500">
                          {count}
                        </Text>
                      </HStack>
                    </Button>
                  );
                })}
              </VStack>
              <HStack className="justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => setMoveTarget(null)}
                >
                  <ButtonText>Cancelar</ButtonText>
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      </Modal>

      <ColumnFormModal
        visible={!!editingColumn}
        title="Editar linha"
        initialTitle={editingColumn?.title}
        onClose={() => setEditingColumn(null)}
        onConfirm={async (title) => {
          if (!editingColumn) return;
          await updateColumn(editingColumn.id, title);
          setEditingColumn(null);
        }}
      />

      <ItemFormModal
        visible={!!creatingItemFor}
        title="Novo item"
        confirmLabel="Criar"
        onClose={() => setCreatingItemFor(null)}
        onConfirm={async (input) => {
          if (!creatingItemFor) return;
          await createItem({
            columnId: creatingItemFor,
            title: input.title,
            description: input.description,
          });
          setCreatingItemFor(null);
        }}
      />

      <ItemFormModal
        visible={!!editingItem}
        title="Editar item"
        confirmLabel="Salvar"
        initial={
          editingItem
            ? { title: editingItem.title, description: editingItem.description }
            : undefined
        }
        onClose={() => setEditingItem(null)}
        onConfirm={async (input) => {
          if (!editingItem) return;
          await updateItem({
            itemId: editingItem.id,
            title: input.title,
            description: input.description,
          });
          setEditingItem(null);
        }}
      />
    </Box>
  );
}
