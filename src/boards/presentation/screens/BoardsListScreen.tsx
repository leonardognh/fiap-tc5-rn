import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import {
  Archive,
  ArchiveRestore,
  MoreVertical,
  Pencil,
  Plus,
  Search,
} from "lucide-react-native";
import { Motion } from "@legendapp/motion";

import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";

import { useAuthStore } from "@/src/auth/store/auth.store";
import { useSettingsStore } from "@/src/settings/store/settings.store";
import { useBoardsStore } from "../../store/boards.store";
import type { Board } from "../../types/boards";
import { BoardFormModal } from "../components/BoardFormModal";

const MotionView = Motion.View as unknown as React.ComponentType<any>;

type ConfirmState = {
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
};

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
  const animationsEnabled = useSettingsStore((s) => s.preferences.animations);
  const focusModeEnabled = useSettingsStore((s) => s.preferences.focusMode ?? false);
  const isFocused = useIsFocused();
  const [appearKey, setAppearKey] = useState(0);

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Board | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ x: number; y: number } | null>(null);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const menuWidth = 180;
  const selectedBoard = openMenuId
    ? items.find((board) => board.id === openMenuId)
    : null;

  useEffect(() => {
    return subscribe(user?.uid ?? null);
  }, [user?.uid, subscribe]);

  useEffect(() => {
    if (isFocused && animationsEnabled) {
      setAppearKey((value) => value + 1);
    }
  }, [isFocused, animationsEnabled]);

  useEffect(() => {
    if (!focusModeEnabled) return;
    if (query.status !== "active") {
      setQuery({ status: "active" as any });
    }
  }, [focusModeEnabled, query.status, setQuery]);

  const statusOptions = useMemo(
    () => [
      { value: "all", label: "Todos" },
      { value: "active", label: "Ativos" },
      { value: "archived", label: "Arquivados" },
    ],
    [],
  );

  const confirmAction = (state: ConfirmState) => setConfirmState(state);

  const onConfirmArchive = (board: Board) => {
    const isArchive = board.status !== "archived";
    const actionLabel = isArchive ? "arquivar" : "desarquivar";
    confirmAction({
      title: "Confirmar",
      message: `Deseja ${actionLabel} o board "${board.title}"?`,
      confirmLabel: isArchive ? "Arquivar" : "Desarquivar",
      destructive: isArchive,
      onConfirm: () =>
        isArchive ? archiveBoard(board.id) : unarchiveBoard(board.id),
    });
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
          </Button>
        </HStack>

        {!focusModeEnabled ? (
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
        ) : null}

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
            {items.map((board, index) => {
              const delay = Math.min(index * 40, 200);
                            const motionProps = {
                initial: animationsEnabled ? { opacity: 0, y: 12 } : { opacity: 1, y: 0 },
                animate: { opacity: 1, y: 0 },
                transition: {
                  type: "timing",
                  duration: animationsEnabled ? 420 : 0,
                  delay: animationsEnabled ? delay : 0,
                  easing: "easeOut",
                },
              };

              return (
                <MotionView
                  key={
                    animationsEnabled
                      ? `${appearKey}-${board.id}`
                      : board.id
                  }
                  {...motionProps}
                >
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: "/(app)/(tabs)/boards/[boardId]",
                        params: { boardId: board.id },
                      })
                    }
                  >
                    <Box
                      className="rounded-2xl border border-outline-200 bg-background-0 p-4 relative"
                    >
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
                                {board.status === "archived"
                                  ? "Arquivado"
                                  : "Ativo"}
                              </Text>
                            </Box>
                          </VStack>
                          <Box className="relative">
                            <Pressable
                              onPress={(event) => {
                                event.stopPropagation?.();
                                const { pageX, pageY } = event.nativeEvent;
                                setOpenMenuId((current) =>
                                  current === board.id ? null : board.id,
                                );
                                setMenuAnchor({ x: pageX, y: pageY });
                              }}
                              hitSlop={8}
                            >
                              <Box className="rounded-full border border-outline-200 bg-background-0 p-2">
                                <MoreVertical size={16} color="#475569" />
                              </Box>
                            </Pressable>
                          </Box>
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
                </MotionView>
              );
            })}
          </VStack>
        </ScrollView>
      </VStack>


      
      <Modal transparent visible={!!openMenuId} animationType="fade">
        <Pressable
          className="flex-1"
          onPress={() => {
            setOpenMenuId(null);
            setMenuAnchor(null);
          }}
        >
          {openMenuId && menuAnchor ? (
            <Box
              className="absolute rounded-xl border border-outline-200 bg-background-0 p-3 shadow-lg"
              style={{
                width: menuWidth,
                zIndex: 9999,
                elevation: 20,
                left: Math.min(
                  Math.max(16, menuAnchor.x - menuWidth + 24),
                  windowWidth - menuWidth - 16,
                ),
                top: Math.min(menuAnchor.y + 12, windowHeight - 180),
              }}
            >
              <Pressable
                onPress={(event) => {
                  event.stopPropagation?.();
                  if (!selectedBoard) return;
                  setEditing(selectedBoard);
                  setOpenMenuId(null);
                  setMenuAnchor(null);
                }}
              >
                <HStack space="sm" className="items-center py-2">
                  <Pencil size={16} color="#475569" />
                  <Text className="text-typography-900">Editar</Text>
                </HStack>
              </Pressable>
              <Pressable
                onPress={(event) => {
                  event.stopPropagation?.();
                  if (!selectedBoard) return;
                  onConfirmArchive(selectedBoard);
                  setOpenMenuId(null);
                  setMenuAnchor(null);
                }}
              >
                <HStack space="sm" className="items-center py-2">
                  {selectedBoard?.status === "archived" ? (
                    <ArchiveRestore size={16} color="#475569" />
                  ) : (
                    <Archive size={16} color="#475569" />
                  )}
                  <Text className="text-typography-900">
                    {selectedBoard?.status === "archived"
                      ? "Desarquivar"
                      : "Arquivar"}
                  </Text>
                </HStack>
              </Pressable>
            </Box>
          ) : null}
        </Pressable>
      </Modal>

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

      <ConfirmModal
        visible={!!confirmState}
        title={confirmState?.title ?? ""}
        message={confirmState?.message ?? ""}
        confirmLabel={confirmState?.confirmLabel}
        destructive={confirmState?.destructive}
        onClose={() => setConfirmState(null)}
        onConfirm={confirmState?.onConfirm ?? (() => {})}
      />
    </Box>
  );
}





























