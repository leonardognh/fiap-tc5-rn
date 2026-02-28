import React, { useMemo, useState } from "react";
import { Pressable, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";

import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import {
  Popover,
  PopoverBackdrop,
  PopoverBody,
  PopoverContent,
} from "@/components/ui/popover";
import { ChevronDown, X } from "lucide-react-native";

import type { BoardColumn } from "../../types/boards";

type ColumnsMultiSelectProps = {
  label: string;
  value: string[];
  options: BoardColumn[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function ColumnsMultiSelect({
  label,
  value,
  options,
  onChange,
  disabled,
  placeholder,
}: ColumnsMultiSelectProps) {
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder ?? t("boards.columns.select_placeholder");
  const selectedIds = useMemo(() => new Set(value), [value]);
  const selectedColumns = useMemo(
    () => options.filter((col) => selectedIds.has(col.id)),
    [options, selectedIds],
  );
  const availableColumns = useMemo(
    () => options.filter((col) => !selectedIds.has(col.id)),
    [options, selectedIds],
  );
  const [open, setOpen] = useState(false);
  const visibleSelected = selectedColumns.slice(0, 3);
  const remainingCount = Math.max(0, selectedColumns.length - visibleSelected.length);

  const remove = (id: string) => {
    if (disabled) return;
    onChange(value.filter((x) => x !== id));
  };

  const add = (id: string) => {
    if (disabled || selectedIds.has(id)) return;
    onChange([...value, id]);
  };

  return (
    <VStack space="xs">
      <Text size="sm" className="text-typography-600">
        {label}
      </Text>
      <Popover
        isOpen={open}
        onOpen={() => {
          if (disabled) return;
          setOpen(true);
        }}
        onClose={() => setOpen(false)}
        placement="bottom left"
        offset={6}
        useRNModal
        trigger={(triggerProps) => (
          <Pressable
            {...triggerProps}
            disabled={disabled}
            className={`rounded-xl border bg-background-0 px-3 ${
              disabled ? "opacity-40" : ""
            } border-outline-300 min-h-[40px]`}
          >
            <Box className="py-2">
              <HStack space="xs" className="items-center justify-between">
                <HStack space="xs" className="flex-1 flex-wrap items-center">
                  {selectedColumns.length === 0 ? (
                    <Text size="xs" className="text-typography-400">
                      {resolvedPlaceholder}
                    </Text>
                  ) : (
                    <>
                      {visibleSelected.map((col) => (
                        <Pressable
                          key={col.id}
                          onPress={(event) => {
                            event.stopPropagation?.();
                            remove(col.id);
                          }}
                        >
                          <Box className="rounded-full border border-outline-200 px-2 py-1">
                            <HStack space="xs" className="items-center">
                              <Text size="xs" className="text-typography-600">
                                {col.title}
                              </Text>
                              {!disabled ? <X size={12} color="#64748b" /> : null}
                            </HStack>
                          </Box>
                        </Pressable>
                      ))}
                      {remainingCount > 0 ? (
                        <Box className="rounded-full border border-outline-200 px-2 py-1">
                          <Text size="xs" className="text-typography-600">
                            +{remainingCount}
                          </Text>
                        </Box>
                      ) : null}
                    </>
                  )}
                </HStack>
                <ChevronDown size={18} color="#64748b" />
              </HStack>
            </Box>
          </Pressable>
        )}
      >
        <PopoverBackdrop onPress={() => setOpen(false)} />
        <PopoverContent>
          <PopoverBody>
            <ScrollView className="max-h-[260px]" keyboardShouldPersistTaps="handled">
              <VStack space="sm" className="p-2">
                {availableColumns.length > 0 ? (
                  <VStack space="xs">
                    <Text size="xs" className="text-typography-500">
                      {t("boards.columns.available")}
                    </Text>
                    {availableColumns.map((col) => (
                      <Pressable
                        key={col.id}
                        onPress={() => add(col.id)}
                        className="min-w-[200px] rounded px-3 py-2 data-[hover=true]:bg-background-50 data-[active=true]:bg-background-100"
                      >
                        <Text size="sm" className="text-typography-800">
                          {col.title}
                        </Text>
                      </Pressable>
                    ))}
                  </VStack>
                ) : (
                  <Text size="xs" className="text-typography-500">
                    {t("boards.columns.none_available")}
                  </Text>
                )}

                {selectedColumns.length > 0 ? (
                  <VStack space="xs">
                    <Text size="xs" className="text-typography-500">
                      {t("boards.columns.selected_hint")}
                    </Text>
                    {selectedColumns.map((col) => (
                      <Pressable key={col.id} onPress={() => remove(col.id)}>
                        <HStack space="sm" className="items-center">
                          <X size={14} color="#64748b" />
                          <Text size="sm" className="text-typography-800">
                            {col.title}
                          </Text>
                        </HStack>
                      </Pressable>
                    ))}
                  </VStack>
                ) : null}
              </VStack>
            </ScrollView>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </VStack>
  );
}