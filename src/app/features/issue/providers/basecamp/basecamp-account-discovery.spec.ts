import {
  parseBasecampAccounts,
  autoSelectAccountId,
  formatBasecampAccountLabel,
} from './basecamp-account-discovery';

describe('basecamp-account-discovery', () => {
  describe('parseBasecampAccounts', () => {
    it('filters out non-bc3 entries and maps numeric id to string', () => {
      const response = {
        accounts: [
          { id: 1, name: 'A', product: 'bc3' },
          { id: 2, name: 'B', product: 'bcx' },
          { id: 3, name: 'C', product: 'bc3' },
        ],
      };
      const result = parseBasecampAccounts(response);
      expect(result).toEqual([
        { id: '1', name: 'A' },
        { id: '3', name: 'C' },
      ]);
    });

    it('returns empty array when accounts is missing', () => {
      const response = {};
      const result = parseBasecampAccounts(response);
      expect(result).toEqual([]);
    });

    it('returns empty array when accounts is not an array', () => {
      const response = { accounts: 'not-an-array' };
      const result = parseBasecampAccounts(response);
      expect(result).toEqual([]);
    });

    it('returns empty array when accounts array is empty', () => {
      const response = { accounts: [] };
      const result = parseBasecampAccounts(response);
      expect(result).toEqual([]);
    });

    it('skips malformed entries with missing name', () => {
      const response = {
        accounts: [
          { id: 1, name: 'Valid', product: 'bc3' },
          { id: 2, product: 'bc3' },
          { id: 3, name: 'Another', product: 'bc3' },
        ],
      };
      const result = parseBasecampAccounts(response);
      expect(result).toEqual([
        { id: '1', name: 'Valid' },
        { id: '3', name: 'Another' },
      ]);
    });

    it('skips null or non-object entries', () => {
      const response = {
        accounts: [
          { id: 1, name: 'Valid', product: 'bc3' },
          null,
          { id: 2, name: 'Another', product: 'bc3' },
        ],
      };
      const result = parseBasecampAccounts(response);
      expect(result).toEqual([
        { id: '1', name: 'Valid' },
        { id: '2', name: 'Another' },
      ]);
    });
  });

  describe('formatBasecampAccountLabel', () => {
    it('includes both account name and id for picker display', () => {
      expect(formatBasecampAccountLabel({ id: '42', name: 'Client Work' })).toBe(
        'Client Work (42)',
      );
    });
  });

  describe('autoSelectAccountId', () => {
    it('returns the account id when there is exactly one account', () => {
      const accounts = [{ id: '1', name: 'Single' }];
      const result = autoSelectAccountId(accounts);
      expect(result).toBe('1');
    });

    it('returns null when there are multiple accounts', () => {
      const accounts = [
        { id: '1', name: 'A' },
        { id: '2', name: 'B' },
      ];
      const result = autoSelectAccountId(accounts);
      expect(result).toBeNull();
    });

    it('returns null when there are no accounts', () => {
      const emptyAccounts: ReturnType<typeof parseBasecampAccounts> = [];
      const result = autoSelectAccountId(emptyAccounts);
      expect(result).toBeNull();
    });
  });
});
