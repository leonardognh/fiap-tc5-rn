export type BoardStatus = "active" | "archived";

export type Board = {
  id: string;
  title: string;
  description?: string;
  createdBy: string;
  members: string[];
  status: BoardStatus;
  createdAt: number;
  updatedAt: number;
};

export type BoardColumn = {
  id: string;
  boardId: string;
  title: string;
  order: number;
  createdAt: number;
  updatedAt: number;
};

export type BoardItem = {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description?: string;
  order: number;
  createdAt: number;
  updatedAt: number;
};

export type BoardsQuery = {
  search: string;
  status: "all" | BoardStatus;
  mine: boolean;
  sort: "updated_desc" | "updated_asc" | "title_asc" | "title_desc";
};

export type BoardFormInput = {
  title: string;
  description?: string;
};

export type ColumnFormInput = {
  title: string;
};

export type ItemFormInput = {
  title: string;
  description?: string;
};
