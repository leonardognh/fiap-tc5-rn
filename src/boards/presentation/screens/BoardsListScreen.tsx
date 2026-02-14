import React, { useEffect, useMemo, useState } from "react";
import { Alert, Platform, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { Archive, ArchiveRestore, Pencil, Plus, Search } from "lucide-react-native";

import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";

import { useAuthStore } from "@/src/auth/store/auth.store";
import { useBoardsStore } from "../../store/boards.store";
import type { Board } from "../../types/boards";
import { BoardFormModal } from "../components/BoardFormModal";

export function BoardsListScreen() {
  const user = useAuthStore((s) => s.user);
  const {
    items,
    loading,
    error,
    query,
    subscribe,
    setQuery,
    createBoard,
    updateBoard,
    archiveBoard,
    unarchiveBoard,
  } = useBoardsStore();

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Board | null>(null);

  useEffect(() => {
    return subscribe(user?.uid ?? null);
  }, [user?.uid, subscribe]);

  const statusOptions = useMemo(
    () => [
      { value: "all", label: "Todos" },
      { value: "active", label: "Ativos" },
      { value: "archived", label: "Arquivados" },
    ],
    [],
  );

  const confirmAction = (title: string, message: string, onConfirm: () => void) => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const ok = window.confirm(`${title}\n\n${message}`);
      if (ok) onConfirm();
      return;
    }

    Alert.alert(title, message, [
      { text: "Cancelar", style: "cancel" },
      { text: "Confirmar", onPress: onConfirm },
    ]);
  };

  const onConfirmArchive = (board: Board) => {
    const actionLabel =
      board.status === "archived" ? "desarquivar" : "arquivar";
    confirmAction(
      "Confirmar",
      `Deseja ${actionLabel} o board "${board.title}"?`,
      () =>
        board.status === "archived"
          ? unarchiveBoard(board.id)
          : archiveBoard(board.id),
    );
  };

  return (
    <Box className="flex-1 bg-background-0">
      <VStack space="md" className="p-6">
        <HStack space="sm" className="items-center">
          <Input className="border-outline-300 rounded-xl flex-1">
            <InputSlot className="pl-3">
              <InputIcon as={Search} />
            </InputSlot>
            <InputField
              placeholder="Buscar board"
              value={query.search}
              onChangeText={(value) => setQuery({ search: value })}
            />
          </Input>
          <Button onPress={() => setCreateOpen(true)} size="sm">
            <ButtonIcon as={Plus} />
            <ButtonText>Novo board</ButtonText>
          </Button>
        </HStack>

        <HStack space="sm" className="flex-wrap">
          {statusOptions.map((opt) => {
            const selected = query.status === opt.value;
            return (
              <Button
                key={opt.value}
                size="xs"
                variant={selected ? "solid" : "outline"}
                action={selected ? "primary" : "secondary"}
                onPress={() => setQuery({ status: opt.value as any })}
                className={selected ? "bg-primary-600" : undefined}
              >
                <ButtonText>{opt.label}</ButtonText>
              </Button>
            );
          })}

          <Button
            size="xs"
            variant={query.mine ? "solid" : "outline"}
            action={query.mine ? "primary" : "secondary"}
            onPress={() => setQuery({ mine: !query.mine })}
            className={query.mine ? "bg-primary-600" : undefined}
          >
            <ButtonText>Meus boards</ButtonText>
          </Button>
        </HStack>

        {error ? (
          <Box className="rounded-xl border border-error-200 bg-error-50 p-3">
            <Text size="sm" className="text-error-600">
              {error}
            </Text>
          </Box>
        ) : null}

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {loading && items.length === 0 ? (
            <Text className="text-typography-500">Carregando...</Text>
          ) : null}

          {!loading && items.length === 0 ? (
            <Box className="rounded-2xl border border-dashed border-outline-200 p-6">
              <Text className="text-typography-600">
                {query.status === "archived"
                  ? "Nenhum board arquivado."
                  : "Nenhum board encontrado. Crie o primeiro para começar."}
              </Text>
            </Box>
          ) : null}

          <VStack space="md">
            {items.map((board) => (
              <Pressable
                key={board.id}
                onPress={() =>
                  router.push({
                    pathname: "/boards/[boardId]",
                    params: { boardId: board.id },
                  })
                }
              >
                <Box className="rounded-2xl border border-outline-200 bg-background-0 p-4">
                  <VStack space="sm">
                    <HStack className="items-start justify-between">
                      <VStack space="xs" className="flex-1 pr-2">
                        <Text
                          size="lg"
                          className="text-typography-900 font-semibold"
                        >
                          {board.title}
                        </Text>
                        <Box
                          className={`self-start rounded-full px-3 py-1 ${
                            board.status === "archived"
                              ? "bg-background-200"
                              : "bg-success-100"
                          }`}
                        >
                          <Text size="xs" className="text-typography-700">
                            {board.status === "archived" ? "Arquivado" : "Ativo"}
                          </Text>
                        </Box>
                      </VStack>
                      <HStack space="xs" className="items-center">
                        <Pressable
                          onPress={(event) => {
                            event.stopPropagation?.();
                            setEditing(board);
                          }}
                          hitSlop={8}
                        >
                          <Box className="rounded-full border border-outline-200 bg-background-0 p-2">
                            <Pencil size={16} color="#475569" />
                          </Box>
                        </Pressable>
                        <Pressable
                          onPress={(event) => {
                            event.stopPropagation?.();
                            onConfirmArchive(board);
                          }}
                          hitSlop={8}
                        >
                          <Box className="rounded-full border border-outline-200 bg-background-0 p-2">
                            {board.status === "archived" ? (
                              <ArchiveRestore size={16} color="#475569" />
                            ) : (
                              <Archive size={16} color="#475569" />
                            )}
                          </Box>
                        </Pressable>
                      </HStack>
                    </HStack>

                  {board.description ? (
                    <Text size="sm" className="text-typography-600">
                      {board.description}
                    </Text>
                  ) : null}

                  <Text size="xs" className="text-typography-400">
                    Atualizado em {new Date(board.updatedAt).toLocaleDateString()}
                  </Text>

                  <HStack space="sm" className="flex-wrap" />
                </VStack>
                </Box>
              </Pressable>
            ))}
          </VStack>
        </ScrollView>
      </VStack>

      <BoardFormModal
        visible={createOpen}
        title="Novo board"
        confirmLabel="Criar"
        onClose={() => setCreateOpen(false)}
        onConfirm={async (input) => {
          await createBoard(input);
          setCreateOpen(false);
        }}
      />

      <BoardFormModal
        visible={!!editing}
        title="Editar board"
        confirmLabel="Salvar"
        initial={
          editing
            ? { title: editing.title, description: editing.description }
            : undefined
        }
        onClose={() => setEditing(null)}
        onConfirm={async (input) => {
          if (!editing) return;
          await updateBoard(editing.id, input);
          setEditing(null);
        }}
      />
    </Box>
  );
}
