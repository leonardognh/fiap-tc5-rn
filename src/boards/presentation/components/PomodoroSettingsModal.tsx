import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react-native";

import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
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
import { Switch } from "@/components/ui/switch";

import type { BoardColumn, PomodoroConfig } from "../../types/boards";

type PomodoroModalInput = {
  pomodoroEnabled: boolean;
  applyOnColumnId: string | null;
  workSeconds: number | null;
  restSeconds: number | null;
  moveOnPauseColumnId: string | null;
  moveOnResumeColumnId: string | null;
  moveOnCompleteColumnId: string | null;
};

type PomodoroSettingsModalProps = {
  visible: boolean;
  columns: BoardColumn[];
  pomodoro?: PomodoroConfig | null;
  onClose: () => void;
  onSave: (input: PomodoroModalInput) => void;
};

const toNumberOrNull = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

export function PomodoroSettingsModal({
  visible,
  columns,
  pomodoro,
  onClose,
  onSave,
}: PomodoroSettingsModalProps) {
  const { t } = useTranslation();
  const [pomodoroEnabled, setPomodoroEnabled] = useState(false);
  const [applyOnColumnId, setApplyOnColumnId] = useState<string | null>(null);
  const [workSeconds, setWorkSeconds] = useState("");
  const [restSeconds, setRestSeconds] = useState("");
  const [moveOnPauseColumnId, setMoveOnPauseColumnId] = useState<string | null>(null);
  const [moveOnResumeColumnId, setMoveOnResumeColumnId] = useState<string | null>(null);
  const [moveOnCompleteColumnId, setMoveOnCompleteColumnId] = useState<
    string | null
  >(null);
  const [submitted, setSubmitted] = useState(false);

  const canConfigure = columns.length >= 3;
  const isActive = pomodoroEnabled && canConfigure;
  const noneValue = "__none__";

  useEffect(() => {
    if (!visible) return;
    setSubmitted(false);
    setPomodoroEnabled(!!pomodoro?.enabled);
    setApplyOnColumnId(pomodoro?.applyOnColumnId ?? null);
    setWorkSeconds(
      typeof pomodoro?.workSeconds === "number" ? String(pomodoro.workSeconds) : "",
    );
    setRestSeconds(
      typeof pomodoro?.restSeconds === "number" ? String(pomodoro.restSeconds) : "",
    );
    setMoveOnPauseColumnId(pomodoro?.moveOnPauseColumnId ?? null);
    setMoveOnResumeColumnId(pomodoro?.moveOnResumeColumnId ?? null);
    setMoveOnCompleteColumnId(pomodoro?.moveOnCompleteColumnId ?? null);
  }, [visible, pomodoro]);

  useEffect(() => {
    if (!canConfigure && pomodoroEnabled) {
      setPomodoroEnabled(false);
    }
  }, [canConfigure, pomodoroEnabled]);

  useEffect(() => {
    const ids = new Set(columns.map((c) => c.id));
    if (applyOnColumnId && !ids.has(applyOnColumnId)) setApplyOnColumnId(null);
    if (moveOnPauseColumnId && !ids.has(moveOnPauseColumnId))
      setMoveOnPauseColumnId(null);
    if (moveOnResumeColumnId && !ids.has(moveOnResumeColumnId))
      setMoveOnResumeColumnId(null);
    if (moveOnCompleteColumnId && !ids.has(moveOnCompleteColumnId))
      setMoveOnCompleteColumnId(null);
  }, [
    columns,
    applyOnColumnId,
    moveOnPauseColumnId,
    moveOnResumeColumnId,
    moveOnCompleteColumnId,
  ]);

  const workValue = useMemo(() => toNumberOrNull(workSeconds), [workSeconds]);
  const restValue = useMemo(() => toNumberOrNull(restSeconds), [restSeconds]);

  const applyError = isActive && submitted && !applyOnColumnId;
  const workRequired = isActive && submitted && workValue === null;
  const workMin = isActive && submitted && workValue !== null && workValue < 60;
  const restRequired = isActive && submitted && restValue === null;
  const restMin = isActive && submitted && restValue !== null && restValue < 30;

  const getMoveOptions = (current: string | null, blocked: Array<string | null>) => {
    const blockedSet = new Set(blocked.filter(Boolean) as string[]);
    if (current) blockedSet.delete(current);
    return columns.filter((c) => !blockedSet.has(c.id));
  };

  const getColumnTitle = (id: string | null) =>
    columns.find((column) => column.id === id)?.title;

  const pauseOptions = useMemo(
    () =>
      getMoveOptions(moveOnPauseColumnId, [
        moveOnResumeColumnId,
        moveOnCompleteColumnId,
      ]),
    [columns, moveOnPauseColumnId, moveOnResumeColumnId, moveOnCompleteColumnId],
  );

  const resumeOptions = useMemo(
    () =>
      getMoveOptions(moveOnResumeColumnId, [
        moveOnPauseColumnId,
        moveOnCompleteColumnId,
      ]),
    [columns, moveOnPauseColumnId, moveOnResumeColumnId, moveOnCompleteColumnId],
  );

  const completeOptions = useMemo(
    () =>
      getMoveOptions(moveOnCompleteColumnId, [
        moveOnPauseColumnId,
        moveOnResumeColumnId,
      ]),
    [columns, moveOnPauseColumnId, moveOnResumeColumnId, moveOnCompleteColumnId],
  );

  const handleMoveChange = (
    value: string,
    setter: (nextValue: string | null) => void,
  ) => {
    setter(value === noneValue ? null : value);
  };

  const handleSave = () => {
    setSubmitted(true);

    if (isActive) {
      if (!applyOnColumnId || workValue === null || workValue < 60 || restValue === null || restValue < 30) {
        return;
      }
    }

    onSave({
      pomodoroEnabled: pomodoroEnabled && canConfigure,
      applyOnColumnId: pomodoroEnabled && canConfigure ? applyOnColumnId : null,
      workSeconds: workValue,
      restSeconds: restValue,
      moveOnPauseColumnId: pomodoroEnabled && canConfigure ? moveOnPauseColumnId : null,
      moveOnResumeColumnId: pomodoroEnabled && canConfigure ? moveOnResumeColumnId : null,
      moveOnCompleteColumnId: pomodoroEnabled && canConfigure ? moveOnCompleteColumnId : null,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Box className="flex-1 items-center justify-center bg-black/50 px-4">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <Box className="w-full max-w-[520px] rounded-2xl bg-background-0 p-5">
          <VStack space="md">
            <Heading size="lg" className="text-typography-900">
              {t("boards.pomodoro.dialogTitle")}
            </Heading>

            <VStack space="xs">
              <Text size="sm" className="text-typography-600">
                {t("boards.pomodoro.enable")}
              </Text>
              {!canConfigure ? (
                <Text size="xs" className="text-typography-500">
                  {t("boards.pomodoro.needColumns")}
                </Text>
              ) : null}
              <Switch
                value={pomodoroEnabled}
                onValueChange={setPomodoroEnabled}
                disabled={!canConfigure}
              />
            </VStack>

            <VStack
              space="md"
              className={!isActive ? "opacity-50" : undefined}
            >
              <VStack space="xs">
                <Text size="sm" className="text-typography-600">
                  {t("boards.pomodoro.applyOnColumn")}
                </Text>
                <Select
                  key={`apply-${applyOnColumnId ?? "none"}`}
                  selectedValue={applyOnColumnId ?? undefined}
                  initialLabel={
                    applyOnColumnId ? getColumnTitle(applyOnColumnId) : undefined
                  }
                  onValueChange={(value) => setApplyOnColumnId(value)}
                  isDisabled={!isActive}
                >
                  <SelectTrigger
                    variant="outline"
                    size="md"
                    className={`rounded-xl ${
                      applyError ? "border-error-500" : "border-outline-300"
                    }`}
                  >
                    <SelectInput placeholder={t("boards.pomodoro.selectLine")} />
                    <SelectIcon as={ChevronDown} className="mr-2 text-typography-500" />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      <SelectScrollView className="max-h-[320px]">
                        {columns.map((column) => (
                          <SelectItem
                            key={column.id}
                            label={column.title}
                            value={column.id}
                          />
                        ))}
                      </SelectScrollView>
                    </SelectContent>
                  </SelectPortal>
                </Select>
                {applyError ? (
                  <Text size="xs" className="text-error-600">
                    {t("boards.pomodoro.selectBaseColumnError")}
                  </Text>
                ) : null}
              </VStack>

              <VStack space="xs">
                <Text size="sm" className="text-typography-600">
                  {t("boards.pomodoro.workSeconds")}
                </Text>
                <Input className="border-outline-300 rounded-xl">
                  <InputField
                    placeholder="1800"
                    keyboardType="numeric"
                    value={workSeconds}
                    onChangeText={setWorkSeconds}
                    editable={isActive}
                  />
                </Input>
                {workRequired ? (
                  <Text size="xs" className="text-error-600">
                    {t("boards.pomodoro.workRequired")}
                  </Text>
                ) : null}
                {workMin ? (
                  <Text size="xs" className="text-error-600">
                    {t("boards.pomodoro.workMin")}
                  </Text>
                ) : null}
              </VStack>

              <VStack space="xs">
                <Text size="sm" className="text-typography-600">
                  {t("boards.pomodoro.restSeconds")}
                </Text>
                <Input className="border-outline-300 rounded-xl">
                  <InputField
                    placeholder="300"
                    keyboardType="numeric"
                    value={restSeconds}
                    onChangeText={setRestSeconds}
                    editable={isActive}
                  />
                </Input>
                {restRequired ? (
                  <Text size="xs" className="text-error-600">
                    {t("boards.pomodoro.restRequired")}
                  </Text>
                ) : null}
                {restMin ? (
                  <Text size="xs" className="text-error-600">
                    {t("boards.pomodoro.restMin")}
                  </Text>
                ) : null}
              </VStack>

              <VStack space="sm">
                <Text size="sm" className="text-typography-600">
                  {t("boards.pomodoro.autoMove")}
                </Text>

                <VStack space="xs">
                  <Text size="sm" className="text-typography-600">
                    {t("boards.pomodoro.moveOnPause")}
                  </Text>
                  <Select
                    key={`pause-${moveOnPauseColumnId ?? "none"}`}
                    selectedValue={moveOnPauseColumnId ?? noneValue}
                    initialLabel={
                      moveOnPauseColumnId
                        ? getColumnTitle(moveOnPauseColumnId)
                        : t("boards.pomodoro.none")
                    }
                    onValueChange={(value) =>
                      handleMoveChange(value, setMoveOnPauseColumnId)
                    }
                    isDisabled={!isActive}
                  >
                    <SelectTrigger
                      variant="outline"
                      size="md"
                      className="rounded-xl border-outline-300"
                    >
                      <SelectInput placeholder={t("boards.pomodoro.none")} />
                      <SelectIcon as={ChevronDown} className="mr-2 text-typography-500" />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent>
                        <SelectDragIndicatorWrapper>
                          <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        <SelectScrollView className="max-h-[320px]">
                          <SelectItem
                            label={t("boards.pomodoro.none")}
                            value={noneValue}
                          />
                          {pauseOptions.map((column) => (
                            <SelectItem
                              key={column.id}
                              label={column.title}
                              value={column.id}
                            />
                          ))}
                        </SelectScrollView>
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                </VStack>

                <VStack space="xs">
                  <Text size="sm" className="text-typography-600">
                    {t("boards.pomodoro.moveOnResume")}
                  </Text>
                  <Select
                    key={`resume-${moveOnResumeColumnId ?? "none"}`}
                    selectedValue={moveOnResumeColumnId ?? noneValue}
                    initialLabel={
                      moveOnResumeColumnId
                        ? getColumnTitle(moveOnResumeColumnId)
                        : t("boards.pomodoro.none")
                    }
                    onValueChange={(value) =>
                      handleMoveChange(value, setMoveOnResumeColumnId)
                    }
                    isDisabled={!isActive}
                  >
                    <SelectTrigger
                      variant="outline"
                      size="md"
                      className="rounded-xl border-outline-300"
                    >
                      <SelectInput placeholder={t("boards.pomodoro.none")} />
                      <SelectIcon as={ChevronDown} className="mr-2 text-typography-500" />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent>
                        <SelectDragIndicatorWrapper>
                          <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        <SelectScrollView className="max-h-[320px]">
                          <SelectItem
                            label={t("boards.pomodoro.none")}
                            value={noneValue}
                          />
                          {resumeOptions.map((column) => (
                            <SelectItem
                              key={column.id}
                              label={column.title}
                              value={column.id}
                            />
                          ))}
                        </SelectScrollView>
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                </VStack>

                <VStack space="xs">
                  <Text size="sm" className="text-typography-600">
                    {t("boards.pomodoro.moveOnComplete")}
                  </Text>
                  <Select
                    key={`complete-${moveOnCompleteColumnId ?? "none"}`}
                    selectedValue={moveOnCompleteColumnId ?? noneValue}
                    initialLabel={
                      moveOnCompleteColumnId
                        ? getColumnTitle(moveOnCompleteColumnId)
                        : t("boards.pomodoro.none")
                    }
                    onValueChange={(value) =>
                      handleMoveChange(value, setMoveOnCompleteColumnId)
                    }
                    isDisabled={!isActive}
                  >
                    <SelectTrigger
                      variant="outline"
                      size="md"
                      className="rounded-xl border-outline-300"
                    >
                      <SelectInput placeholder={t("boards.pomodoro.none")} />
                      <SelectIcon as={ChevronDown} className="mr-2 text-typography-500" />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent>
                        <SelectDragIndicatorWrapper>
                          <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        <SelectScrollView className="max-h-[320px]">
                          <SelectItem
                            label={t("boards.pomodoro.none")}
                            value={noneValue}
                          />
                          {completeOptions.map((column) => (
                            <SelectItem
                              key={column.id}
                              label={column.title}
                              value={column.id}
                            />
                          ))}
                        </SelectScrollView>
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                </VStack>
              </VStack>
            </VStack>

            <HStack className="justify-end" space="sm">
              <Button size="sm" variant="outline" onPress={onClose}>
                <ButtonText>{t("settings.cancel")}</ButtonText>
              </Button>
              <Button size="sm" onPress={handleSave}>
                <ButtonText>{t("settings.save")}</ButtonText>
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Box>
    </Modal>
  );
}
