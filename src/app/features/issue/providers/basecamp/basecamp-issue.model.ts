export interface BasecampBucketRef {
  id: number;
  name?: string;
}

export interface BasecampParentRef {
  id: number;
  title?: string;
  type?: string;
  url?: string;
  app_url?: string;
}

export interface BasecampTodo {
  id: number;
  status?: string;
  content: string;
  description?: string;
  completed: boolean;
  completed_at?: string | null;
  due_on?: string | null;
  starts_on?: string | null;
  created_at?: string;
  updated_at?: string;
  url?: string;
  app_url?: string;
  completion_url?: string;
  parent?: BasecampParentRef | null;
  bucket?: BasecampBucketRef | null;
}

export interface BasecampTodolist {
  id: number;
  title: string;
  name?: string;
  description?: string;
  completed: boolean;
  completed_ratio?: string;
  todos_url?: string;
  app_todos_url?: string;
  bucket?: BasecampBucketRef | null;
  parent?: BasecampParentRef | null;
  url?: string;
  app_url?: string;
}

export interface BasecampPaginatedResult<T> {
  items: T[];
  totalCount?: number;
}
