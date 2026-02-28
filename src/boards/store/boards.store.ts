import { create } from "zustand";
import type { Board, BoardsQuery, Tag } from "../types/boards";
import * as repo from "../data/boards.repository";
import { normalizeText } from "../utils/normalize";

type BoardsState = {
  rawItems: Board[];
  items: Board[];
  loading: boolean;
  error: string | null;
  query: BoardsQuery;
  userId: string | null;
  unsubscribe?: () => void;
  subscribe: (userId: string | null) => () => void;
  setQuery: (patch: Partial<BoardsQuery>) => void;
  createBoard: (input: {
    title: string;
    description?: string;
    tagIds?: string[];
    notStartedColumnIds?: string[];
    doneColumnIds?: string[];
  }) => Promise<void>;
  updateBoard: (
    id: string,
    patch: {
      title?: string;
      description?: string;
      tagIds?: string[];
      tags?: Tag[];
      notStartedColumnIds?: string[];
      doneColumnIds?: string[];
    },
  ) => Promise<void>;
  archiveBoard: (id: string) => Promise<void>;
  unarchiveBoard: (id: string) => Promise<void>;
};

const defaultQuery: BoardsQuery = {
  search: "",
  status: "all",
  mine: false,
  sort: "updated_desc",
};

const applyQuery = (
  items: Board[],
  query: BoardsQuery,
  userId: string | null,
): Board[] => {
  let next = [...items];

  if (query.status !== "all") {
    next = next.filter((b) => b.status === query.status);
  }

  if (query.mine && userId) {
    next = next.filter((b) => b.createdBy === userId);
  }

  const search = normalizeText(query.search);
  if (search) {
    next = next.filter((b) => {
      const hay = normalizeText(`${b.title} ${b.description ?? ""}`);
      return hay.includes(search);
    });
  }

  switch (query.sort) {
    case "updated_asc":
      next.sort((a, b) => a.updatedAt - b.updatedAt);
      break;
    case "title_asc":
      next.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "title_desc":
      next.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case "updated_desc":
    default:
      next.sort((a, b) => b.updatedAt - a.updatedAt);
      break;
  }

  return next;
};

export const useBoardsStore = create<BoardsState>((set, get) => ({
  rawItems: [],
  items: [],
  loading: false,
  error: null,
  query: defaultQuery,
  userId: null,

  subscribe: (userId) => {
    const currentUnsub = get().unsubscribe;
    if (currentUnsub) currentUnsub();

    if (!userId) {
      set({
        userId: null,
        rawItems: [],
        items: [],
        loading: false,
        error: null,
        unsubscribe: undefined,
      });
      return () => {};
    }

    set({ userId, loading: true, error: null });

    const unsubscribe = repo.watchBoards(
      userId,
      (rows) => {
        const q = get().query;
        const next = applyQuery(rows, q, userId);
        set({ rawItems: rows, items: next, loading: false, error: null });
      },
      (err) => {
        set({ error: err.message ?? "Falha ao carregar boards.", loading: false });
      },
    );

    set({ unsubscribe });
    return unsubscribe;
  },

  setQuery: (patch) => {
    const query = { ...get().query, ...patch };
    const { rawItems, userId } = get();
    set({ query, items: applyQuery(rawItems, query, userId) });
  },

  createBoard: async (input) => {
    const userId = get().userId;
    if (!userId) {
      set({ error: "Usuário não autenticado." });
      return;
    }

    set({ loading: true, error: null });
    try {
      await repo.createBoard({
        title: input.title,
        description: input.description,
        createdBy: userId,
        tagIds: input.tagIds,
        notStartedColumnIds: input.notStartedColumnIds,
        doneColumnIds: input.doneColumnIds,
      });
    } catch (err: any) {
      set({ error: err?.message ?? "Falha ao criar board.", loading: false });
    }
  },

  updateBoard: async (id, patch) => {
    set({ loading: true, error: null });
    try {
      await repo.updateBoard(id, patch);
    } catch (err: any) {
      set({ error: err?.message ?? "Falha ao atualizar board.", loading: false });
    }
  },

  archiveBoard: async (id) => {
    set({ loading: true, error: null });
    try {
      await repo.setBoardStatus(id, "archived");
    } catch (err: any) {
      set({ error: err?.message ?? "Falha ao arquivar board.", loading: false });
    }
  },

  unarchiveBoard: async (id) => {
    set({ loading: true, error: null });
    try {
      await repo.setBoardStatus(id, "active");
    } catch (err: any) {
      set({ error: err?.message ?? "Falha ao desarquivar board.", loading: false });
    }
  },
}));
