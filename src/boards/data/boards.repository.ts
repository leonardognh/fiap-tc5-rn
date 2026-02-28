import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { firebaseDb } from "@/src/infrastructure/firebase/firebase.client";
import i18n from "@/src/utils/i18n";
import type {
  Board,
  BoardColumn,
  BoardItem,
  BoardItemPriority,
  BoardStatus,
  Tag,
} from "../types/boards";
import { normalizeText } from "../utils/normalize";
import { listTagsByIds } from "./tags.repository";

type WatchCallback<T> = (value: T) => void;
type ErrorCallback = (error: Error) => void;

const toMillis = (value: any): number => {
  if (typeof value === "number") return value;
  if (value && typeof value.toMillis === "function") return value.toMillis();
  return 0;
};

const priorityValues = new Set<BoardItemPriority>(["low", "medium", "high", "urgent"]);

const toPriority = (value: any): BoardItemPriority | undefined => {
  if (typeof value !== "string") return undefined;
  return priorityValues.has(value as BoardItemPriority)
    ? (value as BoardItemPriority)
    : undefined;
};

const mapBoard = (id: string, data: any): Board => {
  const members = Array.isArray(data?.members)
    ? (data.members as string[])
    : Array.isArray(data?.memberIds)
      ? (data.memberIds as string[])
      : [];

  const pomodoroRaw = data?.pomodoro ?? null;
  const pomodoro = pomodoroRaw
    ? {
        enabled: !!pomodoroRaw.enabled,
        workSeconds:
          typeof pomodoroRaw.workSeconds === "number" ? pomodoroRaw.workSeconds : null,
        restSeconds:
          typeof pomodoroRaw.restSeconds === "number" ? pomodoroRaw.restSeconds : null,
        moveOnPauseColumnId: pomodoroRaw.moveOnPauseColumnId ?? null,
        moveOnResumeColumnId: pomodoroRaw.moveOnResumeColumnId ?? null,
        moveOnCompleteColumnId: pomodoroRaw.moveOnCompleteColumnId ?? null,
        applyOnColumnId: pomodoroRaw.applyOnColumnId ?? null,
      }
    : undefined;

  const tagIds = Array.isArray(data?.tagIds)
    ? (data.tagIds as string[]).filter(Boolean)
    : [];
  const notStartedColumnIds = Array.isArray(data?.notStartedColumnIds)
    ? (data.notStartedColumnIds as string[]).filter(Boolean)
    : [];
  const doneColumnIds = Array.isArray(data?.doneColumnIds)
    ? (data.doneColumnIds as string[]).filter(Boolean)
    : [];

  return {
    id,
    title: String(data?.title ?? data?.name ?? "Board"),
    description: data?.description ?? "",
    createdBy: String(data?.createdBy ?? ""),
    members,
    status: (data?.status ?? "active") as BoardStatus,
    pomodoro,
    tagIds,
    tags: [],
    tags_lc: Array.isArray(data?.tags_lc)
      ? (data.tags_lc as string[]).filter(Boolean)
      : undefined,
    notStartedColumnIds,
    doneColumnIds,
    createdAt: toMillis(data?.createdAt),
    updatedAt: toMillis(data?.updatedAt),
  };
};

const hydrateBoardsWithTags = async (boards: Board[]): Promise<Board[]> => {
  if (!boards.length) return boards;

  const allTagIds = Array.from(
    new Set(boards.flatMap((b) => b.tagIds ?? []).filter(Boolean)),
  );

  if (!allTagIds.length) {
    return boards.map((b) => ({ ...b, tags: [] }));
  }

  const tags = await listTagsByIds(allTagIds);
  const tagsMap = new Map(tags.map((t) => [t.id, t]));

  return boards.map((board) => ({
    ...board,
    tags: (board.tagIds ?? [])
      .map((id) => tagsMap.get(id))
      .filter(Boolean) as Tag[],
  }));
};

const mapColumn = (id: string, data: any): BoardColumn => ({
  id,
  boardId: String(data?.boardId ?? ""),
  title: String(data?.title ?? ""),
  order: typeof data?.order === "number" ? data.order : 0,
  createdAt: toMillis(data?.createdAt),
  updatedAt: toMillis(data?.updatedAt),
});

const mapItem = (id: string, data: any): BoardItem => ({
  id,
  boardId: String(data?.boardId ?? ""),
  columnId: String(data?.columnId ?? ""),
  title: String(data?.title ?? ""),
  description: data?.description ?? "",
  assignedTo: data?.assignedTo ?? null,
  assignedName: data?.assignedName ?? null,
  assignedPhotoUrl: data?.assignedPhotoUrl ?? null,
  priority: toPriority(data?.priority),
  order: typeof data?.order === "number" ? data.order : 0,
  createdAt: toMillis(data?.createdAt),
  updatedAt: toMillis(data?.updatedAt),
});

export function watchBoards(
  userId: string,
  onData: WatchCallback<Board[]>,
  onError?: ErrorCallback,
) {
  const q = query(
    collection(firebaseDb, "boards"),
    where("members", "array-contains", userId),
  );

  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((docSnap) =>
        mapBoard(docSnap.id, docSnap.data()),
      );
      hydrateBoardsWithTags(rows)
        .then((hydrated) => onData(hydrated))
        .catch(() => onData(rows));
    },
    (error) => onError?.(error as Error),
  );
}

export function watchBoard(
  boardId: string,
  onData: WatchCallback<Board | null>,
  onError?: ErrorCallback,
) {
  const ref = doc(firebaseDb, "boards", boardId);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      const board = mapBoard(snap.id, snap.data());
      hydrateBoardsWithTags([board])
        .then((hydrated) => onData(hydrated[0] ?? board))
        .catch(() => onData(board));
    },
    (error) => onError?.(error as Error),
  );
}

export function watchColumns(
  boardId: string,
  onData: WatchCallback<BoardColumn[]>,
  onError?: ErrorCallback,
) {
  const q = query(collection(firebaseDb, "boards", boardId, "columns"));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs
        .map((docSnap) => mapColumn(docSnap.id, docSnap.data()))
        .sort((a, b) => a.order - b.order);
      onData(rows);
    },
    (error) => onError?.(error as Error),
  );
}

export function watchItems(
  boardId: string,
  onData: WatchCallback<BoardItem[]>,
  onError?: ErrorCallback,
) {
  const q = query(collection(firebaseDb, "boards", boardId, "items"));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs
        .map((docSnap) => mapItem(docSnap.id, docSnap.data()))
        .sort((a, b) => a.order - b.order);
      onData(rows);
    },
    (error) => onError?.(error as Error),
  );
}

export async function createBoard(input: {
  title: string;
  description?: string;
  createdBy: string;
  members?: string[];
  tagIds?: string[];
  notStartedColumnIds?: string[];
  doneColumnIds?: string[];
}) {
  const title = input.title.trim();
  if (!title) throw new Error("Título do board é obrigatório.");

  const now = serverTimestamp();
  const createdBy = input.createdBy;

  const members = Array.from(
    new Set([createdBy, ...(input.members ?? [])].filter(Boolean)),
  );

  const description = input.description?.trim();
  const tagIds = Array.isArray(input.tagIds) ? input.tagIds.filter(Boolean) : [];
  const notStartedColumnIds = Array.isArray(input.notStartedColumnIds)
    ? Array.from(new Set(input.notStartedColumnIds.filter(Boolean)))
    : [];
  const doneColumnIds = Array.isArray(input.doneColumnIds)
    ? Array.from(new Set(input.doneColumnIds.filter(Boolean)))
    : [];

  const payload: Record<string, any> = {
    title,
    title_lc: normalizeText(title),
    createdBy,
    members,
    status: "active",
    tagIds,
    tags_lc: [],
    notStartedColumnIds,
    doneColumnIds,
    pomodoro: {
      enabled: false,
      workSeconds: null,
      restSeconds: null,
      moveOnPauseColumnId: null,
      moveOnResumeColumnId: null,
      moveOnCompleteColumnId: null,
      applyOnColumnId: null,
    },
    createdAt: now,
    updatedAt: now,
  };

  if (description) {
    payload.description = description;
  }

  await addDoc(collection(firebaseDb, "boards"), payload);
}

export async function updateBoard(
  boardId: string,
  patch: {
    title?: string;
    description?: string;
    tagIds?: string[];
    tags?: Tag[];
    notStartedColumnIds?: string[];
    doneColumnIds?: string[];
  },
) {
  if (!boardId) throw new Error("Board inválido.");

  const payload: Record<string, any> = {
    updatedAt: serverTimestamp(),
  };

  if (typeof patch.title === "string") {
    const title = patch.title.trim();
    if (!title) throw new Error("Título do board é obrigatório.");
    payload.title = title;
    payload.title_lc = normalizeText(title);
  }

  if ("description" in patch) {
    const description = patch.description?.trim();
    if (description) {
      payload.description = description;
    }
  }

  if (Array.isArray(patch.tags)) {
    payload.tagIds = patch.tags.map((t) => t.id).filter(Boolean);
    payload.tags_lc = patch.tags.map((t) => normalizeText(t.name ?? ""));
  } else if ("tagIds" in patch) {
    const ids = Array.isArray(patch.tagIds)
      ? Array.from(new Set(patch.tagIds.filter(Boolean)))
      : [];
    payload.tagIds = ids;
  }

  if ("notStartedColumnIds" in patch) {
    payload.notStartedColumnIds = Array.isArray(patch.notStartedColumnIds)
      ? Array.from(new Set(patch.notStartedColumnIds.filter(Boolean)))
      : [];
  }

  if ("doneColumnIds" in patch) {
    payload.doneColumnIds = Array.isArray(patch.doneColumnIds)
      ? Array.from(new Set(patch.doneColumnIds.filter(Boolean)))
      : [];
  }

  await updateDoc(doc(firebaseDb, "boards", boardId), payload);
}

export async function updateBoardPomodoro(input: {
  boardId: string;
  pomodoroEnabled: boolean;
  workSeconds?: number | null;
  restSeconds?: number | null;
  moveOnPauseColumnId?: string | null;
  moveOnResumeColumnId?: string | null;
  moveOnCompleteColumnId?: string | null;
  applyOnColumnId?: string | null;
}) {
  const boardId = input.boardId?.trim();
  if (!boardId) throw new Error(i18n.t("boards.errors.board_invalid"));

  if (!input.pomodoroEnabled) {
    await updateDoc(doc(firebaseDb, "boards", boardId), {
      pomodoro: {
        enabled: false,
        workSeconds: input.workSeconds ?? null,
        restSeconds: input.restSeconds ?? null,
        moveOnPauseColumnId: null,
        moveOnResumeColumnId: null,
        moveOnCompleteColumnId: null,
        applyOnColumnId: null,
      },
      updatedAt: serverTimestamp(),
    });
    return;
  }

  const workSecondsRaw =
    typeof input.workSeconds === "number" ? input.workSeconds : 1800;
  const restSecondsRaw =
    typeof input.restSeconds === "number" ? input.restSeconds : 300;

  const workSeconds = Math.trunc(workSecondsRaw);
  const restSeconds = Math.trunc(restSecondsRaw);

  if (workSeconds < 60) {
    throw new Error(i18n.t("boards.errors.pomodoro_work_min"));
  }

  if (restSeconds < 30) {
    throw new Error(i18n.t("boards.errors.pomodoro_rest_min"));
  }

  await updateDoc(doc(firebaseDb, "boards", boardId), {
    pomodoro: {
      enabled: true,
      workSeconds,
      restSeconds,
      moveOnPauseColumnId: input.moveOnPauseColumnId ?? null,
      moveOnResumeColumnId: input.moveOnResumeColumnId ?? null,
      moveOnCompleteColumnId: input.moveOnCompleteColumnId ?? null,
      applyOnColumnId: input.applyOnColumnId ?? null,
    },
    updatedAt: serverTimestamp(),
  });
}

export async function setBoardStatus(
  boardId: string,
  status: BoardStatus,
) {
  if (!boardId) throw new Error("Board inválido.");
  await updateDoc(doc(firebaseDb, "boards", boardId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function createColumn(boardId: string, title: string) {
  const trimmed = title.trim();
  if (!trimmed) throw new Error("Título da coluna é obrigatório.");

  const now = Date.now();
  await addDoc(collection(firebaseDb, "boards", boardId, "columns"), {
    boardId,
    title: trimmed,
    order: now,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateColumn(
  boardId: string,
  columnId: string,
  title: string,
) {
  const trimmed = title.trim();
  if (!trimmed) throw new Error("Título da coluna é obrigatório.");

  await updateDoc(doc(firebaseDb, "boards", boardId, "columns", columnId), {
    title: trimmed,
    updatedAt: Date.now(),
  });
}

export async function reorderColumns(boardId: string, columnIds: string[]) {
  if (!boardId) throw new Error("Board inválido.");
  const base = Date.now();
  const batch = writeBatch(firebaseDb);
  columnIds.forEach((columnId, index) => {
    batch.update(doc(firebaseDb, "boards", boardId, "columns", columnId), {
      order: base + index,
      updatedAt: base,
    });
  });
  await batch.commit();
}

export async function deleteColumn(boardId: string, columnId: string) {
  const batch = writeBatch(firebaseDb);
  const itemsRef = collection(firebaseDb, "boards", boardId, "items");
  const q = query(itemsRef, where("columnId", "==", columnId));
  const itemsSnap = await getDocs(q);
  itemsSnap.forEach((docSnap) => batch.delete(docSnap.ref));

  batch.delete(doc(firebaseDb, "boards", boardId, "columns", columnId));
  await batch.commit();
}

export async function createItem(input: {
  boardId: string;
  columnId: string;
  title: string;
  description?: string;
  priority?: BoardItemPriority;
  assignedTo?: string | null;
  assignedName?: string | null;
  assignedPhotoUrl?: string | null;
}) {
  const trimmed = input.title.trim();
  if (!trimmed) throw new Error("Título do item é obrigatório.");

  const now = Date.now();
  const priority = toPriority(input.priority) ?? "medium";
  await addDoc(collection(firebaseDb, "boards", input.boardId, "items"), {
    boardId: input.boardId,
    columnId: input.columnId,
    title: trimmed,
    description: input.description?.trim() ?? "",
    assignedTo: input.assignedTo ?? null,
    assignedName: input.assignedName ?? null,
    assignedPhotoUrl: input.assignedPhotoUrl ?? null,
    priority,
    order: now,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateItem(input: {
  boardId: string;
  itemId: string;
  title?: string;
  description?: string;
  priority?: BoardItemPriority;
  assignedTo?: string | null;
  assignedName?: string | null;
  assignedPhotoUrl?: string | null;
}) {
  const payload: Record<string, any> = {
    updatedAt: Date.now(),
  };

  if (typeof input.title === "string") {
    const trimmed = input.title.trim();
    if (!trimmed) throw new Error("Título do item é obrigatório.");
    payload.title = trimmed;
  }

  if ("description" in input) {
    payload.description = input.description?.trim() ?? "";
  }

  if (typeof input.priority === "string") {
    payload.priority = toPriority(input.priority) ?? "medium";
  }

  if ("assignedTo" in input) {
    payload.assignedTo = input.assignedTo ?? null;
    payload.assignedName = input.assignedName ?? null;
    payload.assignedPhotoUrl = input.assignedPhotoUrl ?? null;
  }

  await updateDoc(doc(firebaseDb, "boards", input.boardId, "items", input.itemId), payload);
}

export async function deleteItem(boardId: string, itemId: string) {
  await deleteDoc(doc(firebaseDb, "boards", boardId, "items", itemId));
}

export async function moveItem(input: {
  boardId: string;
  itemId: string;
  toColumnId: string;
}) {
  await updateDoc(doc(firebaseDb, "boards", input.boardId, "items", input.itemId), {
    columnId: input.toColumnId,
    order: Date.now(),
    updatedAt: Date.now(),
  });
}

export async function moveItemsBatch(input: {
  boardId: string;
  itemIds: string[];
  toColumnId: string;
}) {
  const boardId = input.boardId?.trim();
  if (!boardId) throw new Error("Board inválido.");
  const itemIds = Array.from(new Set(input.itemIds)).filter(Boolean);
  if (!itemIds.length) return;

  const base = Date.now();
  const batch = writeBatch(firebaseDb);
  itemIds.forEach((itemId, index) => {
    batch.update(doc(firebaseDb, "boards", boardId, "items", itemId), {
      columnId: input.toColumnId,
      order: base + index,
      updatedAt: base,
    });
  });
  await batch.commit();
}
