import { create } from "zustand";
import type { Board, BoardColumn, BoardItem } from "../types/boards";
import * as repo from "../data/boards.repository";

type BoardViewState = {
  boardId: string | null;
  board: Board | null;
  columns: BoardColumn[];
  items: BoardItem[];
  loading: boolean;
  error: string | null;
  unsubscribe?: () => void;
  connect: (boardId: string) => () => void;
  createColumn: (title: string) => Promise<void>;
  updateColumn: (columnId: string, title: string) => Promise<void>;
  deleteColumn: (columnId: string) => Promise<void>;
  reorderColumns: (orderedIds: string[]) => Promise<void>;
  createItem: (input: {
    columnId: string;
    title: string;
    description?: string;
  }) => Promise<void>;
  updateItem: (input: {
    itemId: string;
    title?: string;
    description?: string;
  }) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  moveItem: (itemId: string, toColumnId: string) => Promise<void>;
};

export const useBoardViewStore = create<BoardViewState>((set, get) => ({
  boardId: null,
  board: null,
  columns: [],
  items: [],
  loading: false,
  error: null,

  connect: (boardId) => {
    const currentUnsub = get().unsubscribe;
    if (currentUnsub) currentUnsub();

    set({
      boardId,
      board: null,
      columns: [],
      items: [],
      loading: true,
      error: null,
    });

    let pending = 3;
    const done = () => {
      pending -= 1;
      if (pending <= 0) set({ loading: false });
    };

    let boardReady = false;
    let columnsReady = false;
    let itemsReady = false;

    const unsubBoard = repo.watchBoard(
      boardId,
      (board) => {
        set({ board });
        if (!boardReady) {
          boardReady = true;
          done();
        }
      },
      (err) => set({ error: err.message ?? "Falha ao carregar board.", loading: false }),
    );

    const unsubColumns = repo.watchColumns(
      boardId,
      (columns) => {
        set({ columns });
        if (!columnsReady) {
          columnsReady = true;
          done();
        }
      },
      (err) => set({ error: err.message ?? "Falha ao carregar colunas.", loading: false }),
    );

    const unsubItems = repo.watchItems(
      boardId,
      (items) => {
        set({ items });
        if (!itemsReady) {
          itemsReady = true;
          done();
        }
      },
      (err) => set({ error: err.message ?? "Falha ao carregar itens.", loading: false }),
    );

    const unsubscribe = () => {
      unsubBoard();
      unsubColumns();
      unsubItems();
    };

    set({ unsubscribe });
    return unsubscribe;
  },

  createColumn: async (title) => {
    const boardId = get().boardId;
    if (!boardId) return;
    set({ error: null });
    try {
      await repo.createColumn(boardId, title);
    } catch (err: any) {
      set({ error: err?.message ?? "Falha ao criar coluna." });
    }
  },

  updateColumn: async (columnId, title) => {
    const boardId = get().boardId;
    if (!boardId) return;
    set({ error: null });
    try {
      await repo.updateColumn(boardId, columnId, title);
    } catch (err: any) {
      set({ error: err?.message ?? "Falha ao atualizar coluna." });
    }
  },

  deleteColumn: async (columnId) => {
    const boardId = get().boardId;
    if (!boardId) return;
    set({ error: null });
    try {
      await repo.deleteColumn(boardId, columnId);
    } catch (err: any) {
      set({ error: err?.message ?? "Falha ao remover coluna." });
    }
  },

  reorderColumns: async (orderedIds) => {
    const boardId = get().boardId;
    if (!boardId) return;
    set({ error: null });
    try {
      await repo.reorderColumns(boardId, orderedIds);
    } catch (err: any) {
      set({ error: err?.message ?? "Falha ao reordenar linhas." });
    }
  },

  createItem: async (input) => {
    const boardId = get().boardId;
    if (!boardId) return;
    set({ error: null });
    try {
      await repo.createItem({
        boardId,
        columnId: input.columnId,
        title: input.title,
        description: input.description,
      });
    } catch (err: any) {
      set({ error: err?.message ?? "Falha ao criar item." });
    }
  },

  updateItem: async (input) => {
    const boardId = get().boardId;
    if (!boardId) return;
    set({ error: null });
    try {
      await repo.updateItem({
        boardId,
        itemId: input.itemId,
        title: input.title,
        description: input.description,
      });
    } catch (err: any) {
      set({ error: err?.message ?? "Falha ao atualizar item." });
    }
  },

  deleteItem: async (itemId) => {
    const boardId = get().boardId;
    if (!boardId) return;
    set({ error: null });
    try {
      await repo.deleteItem(boardId, itemId);
    } catch (err: any) {
      set({ error: err?.message ?? "Falha ao remover item." });
    }
  },

  moveItem: async (itemId, toColumnId) => {
    const boardId = get().boardId;
    if (!boardId) return;
    set({ error: null });
    try {
      await repo.moveItem({ boardId, itemId, toColumnId });
    } catch (err: any) {
      set({ error: err?.message ?? "Falha ao mover item." });
    }
  },
}));
