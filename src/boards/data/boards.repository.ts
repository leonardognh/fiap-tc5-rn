import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { firebaseDb } from "@/src/infrastructure/firebase/firebase.client";
import type { Board, BoardColumn, BoardItem, BoardStatus } from "../types/boards";
import { normalizeText } from "../utils/normalize";

type WatchCallback<T> = (value: T) => void;
type ErrorCallback = (error: Error) => void;

const toMillis = (value: any): number => {
  if (typeof value === "number") return value;
  if (value && typeof value.toMillis === "function") return value.toMillis();
  return 0;
};

const mapBoard = (id: string, data: any): Board => {
  const members = Array.isArray(data?.members)
    ? (data.members as string[])
    : Array.isArray(data?.memberIds)
      ? (data.memberIds as string[])
      : [];

  return {
    id,
    title: String(data?.title ?? data?.name ?? "Board"),
    description: data?.description ?? "",
    createdBy: String(data?.createdBy ?? ""),
    members,
    status: (data?.status ?? "active") as BoardStatus,
    createdAt: toMillis(data?.createdAt),
    updatedAt: toMillis(data?.updatedAt),
  };
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
      onData(rows);
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
      onData(mapBoard(snap.id, snap.data()));
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
}) {
  const title = input.title.trim();
  if (!title) throw new Error("Título do board é obrigatório.");

  const now = Date.now();
  const createdBy = input.createdBy;

  const members = Array.from(
    new Set([createdBy, ...(input.members ?? [])].filter(Boolean)),
  );

  await addDoc(collection(firebaseDb, "boards"), {
    title,
    description: input.description?.trim() ?? "",
    title_lc: normalizeText(title),
    createdBy,
    members,
    status: "active",
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateBoard(
  boardId: string,
  patch: { title?: string; description?: string },
) {
  if (!boardId) throw new Error("Board inválido.");

  const payload: Record<string, any> = {
    updatedAt: Date.now(),
  };

  if (typeof patch.title === "string") {
    const title = patch.title.trim();
    if (!title) throw new Error("Título do board é obrigatório.");
    payload.title = title;
    payload.title_lc = normalizeText(title);
  }

  if ("description" in patch) {
    payload.description = patch.description?.trim() ?? "";
  }

  await updateDoc(doc(firebaseDb, "boards", boardId), payload);
}

export async function setBoardStatus(
  boardId: string,
  status: BoardStatus,
) {
  if (!boardId) throw new Error("Board inválido.");
  await updateDoc(doc(firebaseDb, "boards", boardId), {
    status,
    updatedAt: Date.now(),
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
}) {
  const trimmed = input.title.trim();
  if (!trimmed) throw new Error("Título do item é obrigatório.");

  const now = Date.now();
  await addDoc(collection(firebaseDb, "boards", input.boardId, "items"), {
    boardId: input.boardId,
    columnId: input.columnId,
    title: trimmed,
    description: input.description?.trim() ?? "",
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
