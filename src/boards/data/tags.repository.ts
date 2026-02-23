import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAt,
  endAt,
  where,
} from "firebase/firestore";

import { firebaseDb } from "@/src/infrastructure/firebase/firebase.client";
import type { Tag } from "../types/boards";

type FirestoreTagDoc = {
  name: string;
  name_lc: string;
  color?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

const tagsCol = collection(firebaseDb, "tags");

const mapTag = (id: string, data: any): Tag => ({
  id,
  name: String(data?.name ?? ""),
  name_lc: String(data?.name_lc ?? ""),
  color: data?.color ?? null,
});

const toNameLc = (value: string) => value.trim().toLowerCase();

export async function searchTags(rawQuery: string): Promise<Tag[]> {
  const q = toNameLc(rawQuery ?? "");

  if (!q) {
    return listPopularTags();
  }

  const qRef = query(
    tagsCol,
    orderBy("name_lc"),
    startAt(q),
    endAt(`${q}\uf8ff`),
    limit(30),
  );

  const snap = await getDocs(qRef);
  return snap.docs.map((docSnap) => mapTag(docSnap.id, docSnap.data()));
}

export async function listPopularTags(): Promise<Tag[]> {
  const qRef = query(tagsCol, orderBy("updatedAt", "desc"), limit(30));
  const snap = await getDocs(qRef);
  return snap.docs.map((docSnap) => mapTag(docSnap.id, docSnap.data()));
}

export async function listTagsByIds(ids: string[]): Promise<Tag[]> {
  if (!ids?.length) return [];
  const unique = Array.from(new Set(ids.filter(Boolean)));
  if (!unique.length) return [];

  const chunks: string[][] = [];
  for (let i = 0; i < unique.length; i += 10) {
    chunks.push(unique.slice(i, i + 10));
  }

  const results: Tag[] = [];
  for (const chunk of chunks) {
    const qRef = query(tagsCol, where("__name__", "in", chunk));
    const snap = await getDocs(qRef);
    snap.docs.forEach((docSnap) => results.push(mapTag(docSnap.id, docSnap.data())));
  }

  return results;
}

export async function createTag(name: string): Promise<Tag> {
  const trimmed = (name ?? "").trim();
  if (!trimmed) {
    throw new Error("Nome da tag é obrigatório.");
  }

  const name_lc = toNameLc(trimmed);

  const existsQuery = query(tagsCol, where("name_lc", "==", name_lc), limit(1));
  const existsSnap = await getDocs(existsQuery);
  const existingDoc = existsSnap.docs[0];
  if (existingDoc) {
    return mapTag(existingDoc.id, existingDoc.data());
  }

  const doc: FirestoreTagDoc = {
    name: trimmed,
    name_lc,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const created = await addDoc(tagsCol, doc);
  return { id: created.id, name: trimmed, name_lc };
}
