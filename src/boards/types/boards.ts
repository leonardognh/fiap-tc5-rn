export type BoardStatus = "active" | "archived";

export type PomodoroConfig = {
  enabled: boolean;
  workSeconds: number | null;
  restSeconds: number | null;
  moveOnPauseColumnId?: string | null;
  moveOnResumeColumnId?: string | null;
  moveOnCompleteColumnId?: string | null;
  applyOnColumnId?: string | null;
};

export type Tag = {
  id: string;
  name: string;
  name_lc?: string;
  color?: string | null;
};

export type Board = {
  id: string;
  title: string;
  description?: string;
  createdBy: string;
  members: string[];
  status: BoardStatus;
  pomodoro?: PomodoroConfig;
  tagIds: string[];
  tags?: Tag[];
  tags_lc?: string[];
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

export type BoardItemPriority = "low" | "medium" | "high" | "urgent";

export type BoardUser = {
  id: string;
  displayName: string;
  email?: string;
  photoURL?: string;
};

export type BoardItem = {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description?: string;
  assignedTo?: string | null;
  assignedName?: string | null;
  assignedPhotoUrl?: string | null;
  priority?: BoardItemPriority;
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
  tagIds?: string[];
  tags?: Tag[];
};

export type ColumnFormInput = {
  title: string;
};

export type ItemFormInput = {
  title: string;
  description?: string;
  priority?: BoardItemPriority;
  assignedTo?: string | null;
  assignedName?: string | null;
  assignedPhotoUrl?: string | null;
};


