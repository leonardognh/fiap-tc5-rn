import React, { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2 } from "lucide-react-native";

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
  } = useBoardViewStore();

  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [editingColumn, setEditingColumn] = useState<BoardColumn | null>(null);
  const [creatingItemFor, setCreatingItemFor] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<BoardItem | null>(null);

  useEffect(() => {
    if (!boardId) return;
    return connect(boardId);
  }, [boardId, connect]);

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

  const confirmDeleteColumn = (column: BoardColumn) => {
    Alert.alert(
      "Remover coluna",
      `Deseja remover a coluna "${column.title}"? Itens serão apagados.`,
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
              placeholder="Nova coluna"
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
            <ButtonText>Adicionar</ButtonText>
          </Button>
        </HStack>

        {loading && columns.length === 0 ? (
          <Text className="text-typography-500">Carregando...</Text>
        ) : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <HStack space="md" className="pr-8">
            {columns.map((column, index) => {
              const columnItems = itemsByColumn.get(column.id) ?? [];
              return (
                <Box
                  key={column.id}
                  className="w-72 rounded-2xl border border-outline-200 bg-background-50 p-4"
                >
                  <VStack space="sm">
                    <HStack className="items-center justify-between">
                      <Text size="md" className="font-semibold text-typography-900">
                        {column.title}
                      </Text>
                      {!readOnly ? (
                        <HStack space="xs">
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
                        </HStack>
                      ) : null}
                    </HStack>

                    <VStack space="sm">
                      {columnItems.length === 0 ? (
                        <Text size="xs" className="text-typography-500">
                          Sem itens nesta coluna.
                        </Text>
                      ) : null}

                      {columnItems.map((item) => {
                        const prevCol = columns[index - 1];
                        const nextCol = columns[index + 1];
                        return (
                          <Box
                            key={item.id}
                            className="rounded-xl border border-outline-200 bg-background-0 p-3"
                          >
                            <VStack space="xs">
                              <Text size="sm" className="font-semibold text-typography-900">
                                {item.title}
                              </Text>
                              {item.description ? (
                                <Text size="xs" className="text-typography-600">
                                  {item.description}
                                </Text>
                              ) : null}
                              {!readOnly ? (
                                <HStack space="xs" className="flex-wrap">
                                  {prevCol ? (
                                    <Button
                                      size="xs"
                                      variant="outline"
                                      onPress={() => moveItem(item.id, prevCol.id)}
                                    >
                                      <ButtonIcon as={ChevronLeft} />
                                    </Button>
                                  ) : null}
                                  {nextCol ? (
                                    <Button
                                      size="xs"
                                      variant="outline"
                                      onPress={() => moveItem(item.id, nextCol.id)}
                                    >
                                      <ButtonIcon as={ChevronRight} />
                                    </Button>
                                  ) : null}
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    onPress={() => setEditingItem(item)}
                                  >
                                    <ButtonText>Editar</ButtonText>
                                  </Button>
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    action="negative"
                                    onPress={() => confirmDeleteItem(item)}
                                  >
                                    <ButtonText>Remover</ButtonText>
                                  </Button>
                                </HStack>
                              ) : null}
                            </VStack>
                          </Box>
                        );
                      })}
                    </VStack>

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
                </Box>
              );
            })}
          </HStack>
        </ScrollView>
      </VStack>

      <ColumnFormModal
        visible={!!editingColumn}
        title="Editar coluna"
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
