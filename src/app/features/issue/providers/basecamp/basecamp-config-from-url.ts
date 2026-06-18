export interface BasecampTodolistRef {
  accountId: string;
  bucketId: string;
  todolistId: string;
}

export type BasecampTodolistUrlResolution =
  | { kind: 'match'; patch: BasecampTodolistRef }
  | {
      kind: 'account-mismatch';
      currentAccountId: string;
      parsedAccountId: string;
    };

const BASECAMP_HOSTS = new Set(['3.basecamp.com', 'app.basecamp.com']);
const BASECAMP_TODOLIST_PATH_RE = /^\/(\d+)\/buckets\/(\d+)\/todolists\/(\d+)(?:\/|$)/;

export const parseBasecampTodolistUrl = (url: string): BasecampTodolistRef | null => {
  if (typeof url !== 'string' || url.length === 0) {
    return null;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return null;
  }

  if (!BASECAMP_HOSTS.has(parsedUrl.hostname)) {
    return null;
  }

  const match = parsedUrl.pathname.match(BASECAMP_TODOLIST_PATH_RE);
  if (!match) {
    return null;
  }

  return {
    accountId: match[1],
    bucketId: match[2],
    todolistId: match[3],
  };
};

export const resolveBasecampTodolistUrl = (
  parsed: BasecampTodolistRef,
  currentAccountId?: string | null,
): BasecampTodolistUrlResolution => {
  if (currentAccountId && currentAccountId !== parsed.accountId) {
    return {
      kind: 'account-mismatch',
      currentAccountId,
      parsedAccountId: parsed.accountId,
    };
  }

  return {
    kind: 'match',
    patch: {
      accountId: currentAccountId || parsed.accountId,
      bucketId: parsed.bucketId,
      todolistId: parsed.todolistId,
    },
  };
};
