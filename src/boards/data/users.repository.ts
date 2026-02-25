import { collection, getDocs, query, where } from "firebase/firestore";

import { firebaseDb } from "@/src/infrastructure/firebase/firebase.client";
import type { BoardUser } from "../types/boards";

const usersCol = collection(firebaseDb, "users");

const mapUser = (id: string, data: any): BoardUser => ({
  id,
  displayName: String(data?.displayName ?? "Sem nome"),
  email: data?.email ?? undefined,
  photoURL: data?.photoURL ?? undefined,
});

export async function listUsersByIds(ids: string[]): Promise<BoardUser[]> {
  if (!ids?.length) return [];
  const unique = Array.from(new Set(ids.filter(Boolean)));
  if (!unique.length) return [];

  const chunks: string[][] = [];
  for (let i = 0; i < unique.length; i += 10) {
    chunks.push(unique.slice(i, i + 10));
  }

  const results: BoardUser[] = [];
  for (const chunk of chunks) {
    const qRef = query(usersCol, where("__name__", "in", chunk));
    const snap = await getDocs(qRef);
    snap.docs.forEach((docSnap) => results.push(mapUser(docSnap.id, docSnap.data())));
  }

  return results;
}
