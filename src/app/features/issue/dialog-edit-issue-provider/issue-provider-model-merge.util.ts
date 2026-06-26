import { IssueProvider } from '../issue.model';

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const mergePluginConfig = (
  current: Record<string, unknown> | undefined,
  update: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined => {
  if (!current) {
    return update;
  }
  if (!update) {
    return current;
  }

  const merged = { ...current };
  // Deep merge is intentional; nested keys clear only by explicit value, never by omission.
  for (const [key, updateValue] of Object.entries(update)) {
    // Defense-in-depth: skip prototype-polluting keys (pluginConfig comes from form models,
    // not raw JSON.parse, but filter defensively anyway).
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    if (isPlainObject(current[key]) && isPlainObject(updateValue)) {
      merged[key] = mergePluginConfig(current[key], updateValue);
    } else {
      merged[key] = updateValue;
    }
  }

  return merged;
};

export const mergeIssueProviderModelUpdates = (
  currentModel: Partial<IssueProvider>,
  update: Partial<IssueProvider>,
): Partial<IssueProvider> => {
  const currentRecord = currentModel as Record<string, unknown>;
  const updateRecord = update as Record<string, unknown>;
  const next: Record<string, unknown> = { ...currentRecord };

  Object.keys(updateRecord).forEach((key) => {
    if (key === 'isEnabled') {
      return;
    }

    const updateValue = updateRecord[key];
    if (
      key === 'pluginConfig' &&
      updateValue &&
      typeof updateValue === 'object' &&
      !Array.isArray(updateValue)
    ) {
      next[key] = mergePluginConfig(
        currentRecord[key] as Record<string, unknown> | undefined,
        updateValue as Record<string, unknown>,
      );
      return;
    }

    next[key] = updateValue;
  });

  return next as Partial<IssueProvider>;
};
