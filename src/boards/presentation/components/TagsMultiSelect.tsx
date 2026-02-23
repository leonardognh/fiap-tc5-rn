import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView } from "react-native";
import { ChevronDown, Plus, Search, X } from "lucide-react-native";

import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";

import { createTag, searchTags } from "../../data/tags.repository";
import type { Tag } from "../../types/boards";

type TagsMultiSelectProps = {
  value: Tag[];
  onChange: (next: Tag[]) => void;
  disabled?: boolean;
};

const toNameLc = (value: string) => value.trim().toLowerCase();
const tagNameLc = (tag: Tag) => toNameLc(tag.name_lc ?? tag.name ?? "");

export function TagsMultiSelect({
  value,
  onChange,
  disabled,
}: TagsMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchSeq = useRef(0);

  const selectedIds = useMemo(() => new Set(value.map((t) => t.id)), [value]);
  const visibleSelected = useMemo(() => value.slice(0, 3), [value]);
  const remainingCount = Math.max(0, value.length - visibleSelected.length);

  const availableOptions = useMemo(
    () => options.filter((tag) => !selectedIds.has(tag.id)),
    [options, selectedIds],
  );

  const searchValue = search.trim();
  const searchLc = toNameLc(searchValue);
  const hasExact =
    !!searchLc &&
    (value.some((tag) => tagNameLc(tag) === searchLc) ||
      options.some((tag) => tagNameLc(tag) === searchLc));
  const showAdd = !!searchLc && !hasExact;

  useEffect(() => {
    if (!open || disabled) return;
    const seq = ++searchSeq.current;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await searchTags(search);
        if (searchSeq.current === seq) {
          setOptions(results);
        }
      } catch {
        if (searchSeq.current === seq) {
          setOptions([]);
          setError("Falha ao carregar tags.");
        }
      } finally {
        if (searchSeq.current === seq) {
          setLoading(false);
        }
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [open, search, disabled]);

  useEffect(() => {
    if (!open) return;
    setSearch("");
  }, [open]);

  const addTag = (tag: Tag) => {
    if (disabled) return;
    if (!tag?.id || selectedIds.has(tag.id)) return;
    onChange([...value, tag]);
  };

  const removeTag = (id: string) => {
    if (disabled) return;
    onChange(value.filter((tag) => tag.id !== id));
  };

  const handleCreate = async () => {
    if (!showAdd || disabled) return;
    const existing =
      value.find((tag) => tagNameLc(tag) === searchLc) ??
      options.find((tag) => tagNameLc(tag) === searchLc);
    if (existing) {
      addTag(existing);
      setSearch("");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const created = await createTag(searchValue);
      addTag(created);
      setSearch("");
    } catch {
      setError("Falha ao criar tag.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack space="xs">
      <Text size="sm" className="text-typography-600">
        Tags
      </Text>
      <Pressable
        onPress={() => {
          if (disabled) return;
          setOpen((prev) => !prev);
        }}
      >
        <Box className="rounded-xl border border-outline-300 bg-background-0 px-3 py-2 min-h-[52px]">
          <HStack space="xs" className="items-center justify-between">
            <HStack space="xs" className="flex-1 flex-wrap items-center">
              {value.length === 0 ? (
                <Text size="xs" className="text-typography-400">
                  Selecione...
                </Text>
              ) : (
                <>
                  {visibleSelected.map((tag) => (
                    <Pressable
                      key={tag.id}
                      onPress={(event) => {
                        event.stopPropagation?.();
                        if (disabled) return;
                        removeTag(tag.id);
                      }}
                    >
                      <Box className="rounded-full border border-outline-200 px-2 py-1">
                        <HStack space="xs" className="items-center">
                          <Text size="xs" className="text-typography-600">
                            {tag.name}
                          </Text>
                          {!disabled ? (
                            <Text size="xs" className="text-typography-400">
                              ×
                            </Text>
                          ) : null}
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
            <ChevronDown size={16} color="#64748b" />
          </HStack>
        </Box>
      </Pressable>

      {open ? (
        <Box className="rounded-xl border border-outline-200 bg-background-0 overflow-hidden">
          <Box className="border-b border-outline-200 p-3">
            <Input className="border-outline-300 rounded-xl">
              <InputSlot className="pl-3">
                <InputIcon as={Search} />
              </InputSlot>
              <InputField
                placeholder="Pesquise ou adicione tags..."
                value={search}
                onChangeText={setSearch}
                editable={!disabled}
              />
            </Input>
          </Box>

          <ScrollView
            className="max-h-[260px]"
            keyboardShouldPersistTaps="handled"
          >
            <VStack space="sm" className="p-3">
              {error ? (
                <Text size="xs" className="text-error-600">
                  {error}
                </Text>
              ) : null}

              {loading ? (
                <Text size="xs" className="text-typography-500">
                  Carregando...
                </Text>
              ) : null}

              {availableOptions.length > 0 ? (
                <VStack space="xs">
                  <Text size="xs" className="text-typography-500">
                    Tags disponíveis
                  </Text>
                  {availableOptions.map((tag) => (
                    <Pressable
                      key={tag.id}
                      onPress={() => addTag(tag)}
                      className="rounded-lg px-3 py-2 hover:bg-background-50 active:bg-background-100"
                    >
                      <Text size="sm" className="text-typography-800">
                        {tag.name}
                      </Text>
                    </Pressable>
                  ))}
                </VStack>
              ) : !showAdd && !loading ? (
                <Text size="xs" className="text-typography-500">
                  Nenhuma tag encontrada.
                </Text>
              ) : null}

              {showAdd ? (
                <Pressable
                  onPress={handleCreate}
                  disabled={loading}
                  className="rounded-lg px-3 py-2 hover:bg-background-50 active:bg-background-100"
                >
                  <HStack space="sm" className="items-center">
                    <Plus size={16} color="#64748b" />
                    <Text size="sm" className="text-typography-800">
                      Adicionar "{searchValue}"
                    </Text>
                  </HStack>
                </Pressable>
              ) : null}

              {value.length > 0 ? (
                <VStack space="xs">
                  <Text size="xs" className="text-typography-500">
                    Selecionadas (clique para remover)
                  </Text>
                  {value.map((tag) => (
                    <Pressable key={tag.id} onPress={() => removeTag(tag.id)}>
                      <HStack space="sm" className="items-center">
                        <X size={14} color="#64748b" />
                        <Text size="sm" className="text-typography-800">
                          {tag.name}
                        </Text>
                      </HStack>
                    </Pressable>
                  ))}
                </VStack>
              ) : null}
            </VStack>
          </ScrollView>
        </Box>
      ) : null}
    </VStack>
  );
}
