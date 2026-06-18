export interface BasecampAccount {
  id: string;
  name: string;
}

interface RawBasecampAccount {
  id: number | string;
  name: string;
  product: string;
}

/** launchpad authorization.json shape: { accounts: [{ id, name, product, href }] }. Keep BC3 only. */
export const parseBasecampAccounts = (response: unknown): BasecampAccount[] => {
  const accounts = (response as { accounts?: unknown } | null)?.accounts;
  if (!Array.isArray(accounts)) {
    return [];
  }
  return (accounts as unknown[])
    .filter(
      (a): a is RawBasecampAccount =>
        !!a &&
        typeof a === 'object' &&
        (a as { product?: unknown }).product === 'bc3' &&
        typeof (a as { name?: unknown }).name === 'string',
    )
    .map((a) => ({ id: String(a.id), name: a.name }));
};

export const autoSelectAccountId = (accounts: BasecampAccount[]): string | null =>
  accounts.length === 1 ? accounts[0].id : null;

export const formatBasecampAccountLabel = (account: BasecampAccount): string =>
  `${account.name} (${account.id})`;
