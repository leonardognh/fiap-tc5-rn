import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, useWindowDimensions } from "react-native";
import { DraxList, DraxListItem, DraxProvider } from "react-native-drax";
import { router, useLocalSearchParams } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  MoreVertical,
  Plus,
  Pencil,
  Timer,
  Trash2,
} from "lucide-react-native";
import { Motion } from "@legendapp/motion";

import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { useToast, Toast, ToastDescription, ToastTitle } from "@/components/ui/toast";

import { useSettingsStore } from "@/src/settings/store/settings.store";
import { useBoardViewStore } from "../../store/board-view.store";
import type { BoardColumn, BoardItem } from "../../types/boards";
import { ColumnFormModal } from "../components/ColumnFormModal";
import { ItemFormModal } from "../components/ItemFormModal";
import { PomodoroLockModal } from "../components/PomodoroLockModal";
import { PomodoroSettingsModal } from "../components/PomodoroSettingsModal";

const MotionView = Motion.View as unknown as React.ComponentType<any>;

type PomodoroStage = "work" | "rest" | null;

type PomodoroRuntimeState = {
  running: boolean;
  stage: PomodoroStage;
  secondsLeft: number;
  endsAt: number | null;
  cycleId: number;
  lastConfigHash: string | null;
};

export function BoardScreen() {
  const params = useLocalSearchParams<{ boardId?: string }>();
  const boardId = Array.isArray(params.boardId)
    ? params.boardId[0]
    : params.boardId;
  const navigation = useNavigation();
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
    moveItemsBatch,
    reorderColumns,
    updatePomodoro,
  } = useBoardViewStore();

  const preferences = useSettingsStore((s) => s.preferences);
  const toast = useToast();
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [editingColumn, setEditingColumn] = useState<BoardColumn | null>(null);
  const [creatingItemFor, setCreatingItemFor] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<BoardItem | null>(null);
  const [expandedLines, setExpandedLines] = useState<string[]>([]);
  const [orderedColumns, setOrderedColumns] = useState<BoardColumn[]>([]);
  const [pomodoroOpen, setPomodoroOpen] = useState(false);
  const [openColumnMenuId, setOpenColumnMenuId] = useState<string | null>(null);
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<{ x: number; y: number } | null>(null);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const menuWidth = 180;
  const selectedColumn = openColumnMenuId
    ? columns.find((column) => column.id === openColumnMenuId)
    : null;
  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    destructive?: boolean;
    onConfirm: () => void;
  } | null>(null);
  const [pomodoroState, setPomodoroState] = useState<PomodoroRuntimeState>({
    running: false,
    stage: null,
    secondsLeft: 0,
    endsAt: null,
    cycleId: 0,
    lastConfigHash: null,
  });
  const [lockState, setLockState] = useState<{
    open: boolean;
    cycleId: number | null;
  }>({
    open: false,
    cycleId: null,
  });
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const itemsRef = useRef<BoardItem[]>([]);
  const movedByCycleRef = useRef<Map<number, string[]>>(new Map());

  useEffect(() => {
    if (!boardId) return;
    return connect(boardId);
  }, [boardId, connect]);

  useEffect(() => {
    setOrderedColumns(columns);
  }, [columns]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useLayoutEffect(() => {
    const isArchived = board?.status === "archived";
    const statusLabel = isArchived ? "Arquivado" : "Ativo";
    const statusClass = isArchived ? "bg-background-200" : "bg-success-100";
    navigation.setOptions({
      headerTitleAlign: "left",
      headerTitle: () => (
        <HStack space="sm" className="items-center">
          <Text size="sm" className="text-typography-900 font-semibold">
            {board?.title ?? "Board"}
          </Text>
          <Box className={`rounded-full px-3 py-1 ${statusClass}`}>
            <Text size="xs" className="text-typography-700">
              {statusLabel}
            </Text>
          </Box>
        </HStack>
      ),
      headerLeft: () => null,
    });
  }, [navigation, board?.title]);

  const readOnly = board?.status === "archived";
  const animationsEnabled = preferences.animations ?? true;
  const pomodoroAllowed = preferences.cognitiveAlerts?.pomodoroPause ?? true;
  const showPomodoro = pomodoroAllowed && !readOnly;

  const itemsByColumn = useMemo(() => {
    const map = new Map<string, BoardItem[]>();
    items.forEach((item) => {
      const arr = map.get(item.columnId) ?? [];
      arr.push(item);
      map.set(item.columnId, arr);
    });
    return map;
  }, [items]);

  const pomodoroConfig = board?.pomodoro ?? null;
  const pomodoroEnabled =
    !!pomodoroConfig?.enabled && pomodoroAllowed && !readOnly && columns.length >= 3;
  const applyOnColumnId = pomodoroEnabled ? pomodoroConfig?.applyOnColumnId ?? null : null;
  const baseColumnExists = applyOnColumnId
    ? columns.some((column) => column.id === applyOnColumnId)
    : false;
  const baseHasItems =
    !!applyOnColumnId && baseColumnExists
      ? (itemsByColumn.get(applyOnColumnId) ?? []).length > 0
      : false;

  const pomodoroHash = useMemo(() => {
    if (!pomodoroConfig) return null;
    return JSON.stringify({
      enabled: pomodoroConfig.enabled,
      workSeconds: pomodoroConfig.workSeconds,
      restSeconds: pomodoroConfig.restSeconds,
      applyOnColumnId: pomodoroConfig.applyOnColumnId ?? null,
      moveOnPauseColumnId: pomodoroConfig.moveOnPauseColumnId ?? null,
      moveOnResumeColumnId: pomodoroConfig.moveOnResumeColumnId ?? null,
      moveOnCompleteColumnId: pomodoroConfig.moveOnCompleteColumnId ?? null,
    });
  }, [pomodoroConfig]);

  const clearTick = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const stopPomodoro = useCallback(() => {
    clearTick();
    setPomodoroState((prev) => ({
      ...prev,
      running: false,
      stage: null,
      secondsLeft: 0,
      endsAt: null,
    }));
  }, [clearTick]);

  const moveItemsBetweenColumns = useCallback(
    async (fromColumnId: string, toColumnId: string, itemIds: string[]) => {
      if (!fromColumnId || !toColumnId || itemIds.length === 0) return;
      const existingIds = new Set(itemsRef.current.map((item) => item.id));
      const idsToMove = Array.from(new Set(itemIds)).filter((id) => existingIds.has(id));
      if (!idsToMove.length) return;
      await moveItemsBatch(idsToMove, toColumnId);
    },
    [moveItemsBatch],
  );

  const startCountdown = useCallback(
    (stage: PomodoroStage, seconds: number, cycleId: number, onDone: () => void) => {
      clearTick();
      const totalSeconds = Math.max(0, Math.floor(seconds));
      const endsAt = Date.now() + totalSeconds * 1000;
      setPomodoroState((prev) => ({
        ...prev,
        running: true,
        stage,
        secondsLeft: totalSeconds,
        endsAt,
        cycleId,
      }));

      tickRef.current = setInterval(() => {
        const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
        setPomodoroState((prev) => ({
          ...prev,
          secondsLeft: left,
        }));
        if (left <= 0) {
          clearTick();
          setPomodoroState((prev) => ({
            ...prev,
            running: false,
            stage: null,
            secondsLeft: 0,
            endsAt: null,
          }));
          onDone();
        }
      }, 1000);
    },
    [clearTick],
  );

  const handleRestFinished = useCallback(() => {
    // keep lock open; user decides when to continue or complete
  }, []);

  const handleWorkFinished = useCallback(
    (config: NonNullable<typeof pomodoroConfig>, cycleId: number) => {
      setLockState({ open: true, cycleId });

      const restSeconds =
        typeof config.restSeconds === "number" && config.restSeconds > 0
          ? config.restSeconds
          : 5 * 60;

      startCountdown("rest", restSeconds, cycleId, handleRestFinished);

      const fromColumnId = config.applyOnColumnId ?? null;
      const toColumnId = config.moveOnPauseColumnId ?? null;
      if (!fromColumnId || !toColumnId) return;

      const idsToMove = itemsRef.current
        .filter((item) => item.columnId === fromColumnId)
        .map((item) => item.id);
      movedByCycleRef.current.set(cycleId, idsToMove);
      moveItemsBetweenColumns(fromColumnId, toColumnId, idsToMove);
    },
    [handleRestFinished, moveItemsBetweenColumns, startCountdown],
  );

  const startWork = useCallback(
    (config: NonNullable<typeof pomodoroConfig>, configHash: string | null) => {
      const workSeconds =
        typeof config.workSeconds === "number" && config.workSeconds > 0
          ? config.workSeconds
          : 25 * 60;

      const nextCycleId = pomodoroState.cycleId + 1;
      setPomodoroState((prev) => ({
        ...prev,
        cycleId: nextCycleId,
        lastConfigHash: configHash,
      }));

      startCountdown("work", workSeconds, nextCycleId, () =>
        handleWorkFinished(config, nextCycleId),
      );
    },
    [handleWorkFinished, pomodoroState.cycleId, startCountdown],
  );

  const handlePomodoroDecision = useCallback(
    async (action: "continue" | "complete") => {
      if (!lockState.open || lockState.cycleId === null) return;
      if (!pomodoroConfig?.enabled) {
        setLockState({ open: false, cycleId: null });
        return;
      }

      const sourceColumnId =
        pomodoroConfig.moveOnPauseColumnId ?? pomodoroConfig.applyOnColumnId ?? null;
      const targetColumnId =
        action === "continue"
          ? pomodoroConfig.moveOnResumeColumnId ?? null
          : pomodoroConfig.moveOnCompleteColumnId ?? null;
      const movedIds = movedByCycleRef.current.get(lockState.cycleId) ?? [];

      if (sourceColumnId && targetColumnId && movedIds.length) {
        await moveItemsBetweenColumns(sourceColumnId, targetColumnId, movedIds);
      }

      movedByCycleRef.current.delete(lockState.cycleId);
      setLockState({ open: false, cycleId: null });
    },
    [lockState, moveItemsBetweenColumns, pomodoroConfig],
  );

  useEffect(() => {
    return () => {
      clearTick();
    };
  }, [clearTick]);

  useEffect(() => {
    setPomodoroState({
      running: false,
      stage: null,
      secondsLeft: 0,
      endsAt: null,
      cycleId: 0,
      lastConfigHash: null,
    });
    setLockState({ open: false, cycleId: null });
    movedByCycleRef.current.clear();
    clearTick();
  }, [boardId, clearTick]);

  useEffect(() => {
    if (!pomodoroEnabled) {
      stopPomodoro();
      if (lockState.open) setLockState({ open: false, cycleId: null });
      movedByCycleRef.current.clear();
      return;
    }

    if (!applyOnColumnId || !baseColumnExists) {
      if (pomodoroState.running) stopPomodoro();
      return;
    }

    if (!baseHasItems) {
      if (pomodoroState.running && pomodoroState.stage === "work") stopPomodoro();
      return;
    }

    if (lockState.open) return;

    if (!pomodoroState.running && pomodoroConfig) {
      startWork(pomodoroConfig, pomodoroHash);
      return;
    }

    if (pomodoroHash && pomodoroHash !== pomodoroState.lastConfigHash) {
      setPomodoroState((prev) => ({ ...prev, lastConfigHash: pomodoroHash }));
    }
  }, [
    applyOnColumnId,
    baseColumnExists,
    baseHasItems,
    lockState.open,
    pomodoroConfig,
    pomodoroEnabled,
    pomodoroHash,
    pomodoroState.lastConfigHash,
    pomodoroState.running,
    pomodoroState.stage,
    startWork,
    stopPomodoro,
  ]);

  const toggleLine = (columnId: string) => {
    setExpandedLines((current) =>
      current.includes(columnId)
        ? current.filter((id) => id !== columnId)
        : [...current, columnId],
    );
  };

  const handleMoveTo = async (itemId: string, toColumnId: string) => {
    await moveItem(itemId, toColumnId);
  };

  const handleReorderLines = async (ordered: BoardColumn[]) => {
    if (readOnly) return;
    await reorderColumns(ordered.map((col) => col.id));
  };
  const confirmDeleteColumn = (column: BoardColumn) => {
    const itemsCount = itemsByColumn.get(column.id)?.length ?? 0;
    if (itemsCount > 0) {
      toast.show({
        placement: "top",
        duration: 3000,
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="warning" variant="solid">
            <ToastTitle>Não é possível apagar</ToastTitle>
            <ToastDescription>
              Remova os itens desta classificação antes de apagá-la.
            </ToastDescription>
          </Toast>
        ),
      });
      return;
    }

    setConfirmState({
      title: "Remover classificação",
      message: `Deseja remover a classificação "${column.title}"?`,
      confirmLabel: "Remover",
      destructive: true,
      onConfirm: () => deleteColumn(column.id),
    });
  };

  const confirmDeleteItem = (item: BoardItem) => {
    setConfirmState({
      title: "Remover item",
      message: `Deseja remover "${item.title}"?`,
      confirmLabel: "Remover",
      destructive: true,
      onConfirm: () => deleteItem(item.id),
    });
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
      <VStack space="md" className="p-6 flex-1 min-h-0">

        {error ? (
          <Box className="rounded-xl border border-error-200 bg-error-50 p-3">
            <Text size="sm" className="text-error-600">
              {error}
            </Text>
          </Box>
        ) : null}

        <HStack space="sm" className="items-center">
          <Button
            size="xs"
            variant="outline"
            onPress={() => router.back()}
            accessibilityLabel="Voltar"
          >
            <ButtonIcon as={ChevronLeft} />
          </Button>
          <Input className="border-outline-300 rounded-xl flex-1">
            <InputField
              placeholder="Nova classificação"
              value={newColumnTitle}
              onChangeText={setNewColumnTitle}
              onSubmitEditing={handleAddColumn}
              returnKeyType="done"
              editable={!readOnly}
            />
          </Input>
          {showPomodoro ? (
            <Button
              size="sm"
              variant="outline"
              onPress={() => setPomodoroOpen(true)}
            >
              <ButtonIcon as={Timer} />
            </Button>
          ) : null}
          <Button
            size="sm"
            onPress={handleAddColumn}
            isDisabled={readOnly || !newColumnTitle.trim()}
            
          >
            <ButtonIcon as={Plus} />
          </Button>
        </HStack>

        {loading && columns.length === 0 ? (
          <Text className="text-typography-500">Carregando...</Text>
        ) : null}

        <Box className="flex-1 min-h-0">
          <DraxProvider style={{ flex: 1 }}>
            <DraxList
              data={orderedColumns}
              keyExtractor={(column) => column.id}
              contentContainerStyle={{ paddingBottom: 32, paddingTop: 4 }}
              longPressDelay={150}
              reorderable={!readOnly}
              showsVerticalScrollIndicator
              scrollEnabled
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              style={{ flex: 1 }}
              parentDraxViewProps={{ style: { flex: 1 } }}
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
                const delay = Math.min((info.index ?? 0) * 40, 200);
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
                    <MotionView {...motionProps}>
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
                          <Pressable
                            onPress={(event) => {
                              event.stopPropagation?.();
                              const { pageX, pageY } = event.nativeEvent;
                              setOpenColumnMenuId((current) =>
                                current === column.id ? null : column.id,
                              );
                              setColumnMenuAnchor({ x: pageX, y: pageY });
                            }}
                            hitSlop={8}
                          >
                            <Box className="rounded-full border border-outline-200 bg-background-0 p-2">
                              <MoreVertical size={16} color="#475569" />
    </Box>
                          </Pressable>
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
                              <HStack className="items-start justify-between">
                                <Text size="sm" className="font-semibold text-typography-900 flex-1 pr-2">
                                  {task.title}
                                </Text>
                                {!readOnly ? (
                                  <HStack space="xs" className="items-center">
                                    <Button
                                      size="xs"
                                      variant="link"
                                      onPress={() => setEditingItem(task)}
                                      accessibilityLabel="Editar item"
                                    >
                                      <ButtonIcon as={Pencil} />
                                    </Button>
                                  </HStack>
                                ) : null}
                              </HStack>
                              {task.description ? (
                                <Text size="xs" className="text-typography-600">
                                  {task.description}
                                </Text>
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
                    </MotionView>
                  </DraxListItem>
                );
              }}
            />
          </DraxProvider>
        </Box>
      </VStack>


      <Modal transparent visible={!!openColumnMenuId} animationType="fade">
        <Pressable
          className="flex-1"
          onPress={() => {
            setOpenColumnMenuId(null);
            setColumnMenuAnchor(null);
          }}
        >
          {openColumnMenuId && columnMenuAnchor ? (
            <Box
              className="absolute rounded-xl border border-outline-200 bg-background-0 p-3 shadow-lg"
              style={{
                width: menuWidth,
                zIndex: 9999,
                elevation: 20,
                left: Math.min(
                  Math.max(16, columnMenuAnchor.x - menuWidth + 24),
                  windowWidth - menuWidth - 16,
                ),
                top: Math.min(columnMenuAnchor.y + 12, windowHeight - 180),
              }}
            >
              <Pressable
                onPress={(event) => {
                  event.stopPropagation?.();
                  if (!selectedColumn) return;
                  setEditingColumn(selectedColumn);
                  setOpenColumnMenuId(null);
                  setColumnMenuAnchor(null);
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
                  if (!selectedColumn) return;
                  confirmDeleteColumn(selectedColumn);
                  setOpenColumnMenuId(null);
                  setColumnMenuAnchor(null);
                }}
              >
                <HStack space="sm" className="items-center py-2">
                  <Trash2 size={16} color="#ef4444" />
                  <Text className="text-typography-900">Remover</Text>
                </HStack>
              </Pressable>
            </Box>
          ) : null}
        </Pressable>
      </Modal>

      <PomodoroSettingsModal
        visible={pomodoroOpen}
        columns={columns}
        pomodoro={board?.pomodoro ?? null}
        onClose={() => setPomodoroOpen(false)}
        onSave={async (input) => {
          await updatePomodoro(input);
          setPomodoroOpen(false);
        }}
      />

      <PomodoroLockModal
        visible={lockState.open}
        secondsLeft={pomodoroState.secondsLeft}
        onContinue={() => handlePomodoroDecision("continue")}
        onComplete={() => handlePomodoroDecision("complete")}
      />

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
        moveOptions={
          editingItem
            ? {
                columns,
                currentColumnId: editingItem.columnId,
                onMove: (value) => handleMoveTo(editingItem.id, value),
                disabled: readOnly || columns.length < 2,
              }
            : undefined
        }
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
    
      <ConfirmModal
        visible={!!confirmState}
        title={confirmState?.title ?? ""}
        message={confirmState?.message ?? ""}
        confirmLabel={confirmState?.confirmLabel}
        destructive={confirmState?.destructive}
        onClose={() => setConfirmState(null)}
        onConfirm={() => { confirmState?.onConfirm?.(); setConfirmState(null); }}
      />
    </Box>
  );
}













































