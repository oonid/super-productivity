import {
  parseBasecampTodolistUrl,
  resolveBasecampTodolistUrl,
} from './basecamp-config-from-url';

describe('parseBasecampTodolistUrl', () => {
  it('should parse a 3.basecamp.com URL correctly', () => {
    const url = 'https://3.basecamp.com/1234567/buckets/2345678/todolists/3456789';
    const result = parseBasecampTodolistUrl(url);

    expect(result).not.toBeNull();
    expect(result?.accountId).toBe('1234567');
    expect(result?.bucketId).toBe('2345678');
    expect(result?.todolistId).toBe('3456789');
  });

  it('should parse an app.basecamp.com URL correctly', () => {
    const url = 'https://app.basecamp.com/1234567/buckets/2345678/todolists/3456789';
    const result = parseBasecampTodolistUrl(url);

    expect(result).not.toBeNull();
    expect(result?.accountId).toBe('1234567');
    expect(result?.bucketId).toBe('2345678');
    expect(result?.todolistId).toBe('3456789');
  });

  it('should handle trailing path segments', () => {
    const url = 'https://3.basecamp.com/1234567/buckets/2345678/todolists/3456789/groups';
    const result = parseBasecampTodolistUrl(url);

    expect(result).not.toBeNull();
    expect(result?.todolistId).toBe('3456789');
  });

  it('should handle trailing query parameters', () => {
    const url =
      'https://3.basecamp.com/1234567/buckets/2345678/todolists/3456789?foo=bar';
    const result = parseBasecampTodolistUrl(url);

    expect(result).not.toBeNull();
    expect(result?.todolistId).toBe('3456789');
  });

  it('should return null for a non-Basecamp URL', () => {
    const url = 'https://example.com/1234567/buckets/2345678/todolists/3456789';
    const result = parseBasecampTodolistUrl(url);

    expect(result).toBeNull();
  });

  it('should return null when the Basecamp-looking path is only embedded inside unrelated text', () => {
    const url =
      'prefix text https://3.basecamp.com/1234567/buckets/2345678/todolists/3456789 suffix';
    const result = parseBasecampTodolistUrl(url);

    expect(result).toBeNull();
  });

  it('should return null for a partial Basecamp URL missing /todolists/{id}', () => {
    const url = 'https://3.basecamp.com/1234567/buckets/2345678';
    const result = parseBasecampTodolistUrl(url);

    expect(result).toBeNull();
  });

  it('should return null for an empty string', () => {
    const result = parseBasecampTodolistUrl('');

    expect(result).toBeNull();
  });

  it('should return null for a random string', () => {
    const result = parseBasecampTodolistUrl('not a url at all');

    expect(result).toBeNull();
  });
});

describe('resolveBasecampTodolistUrl', () => {
  const parsed = {
    accountId: '1234567',
    bucketId: '2345678',
    todolistId: '3456789',
  };

  it('uses the parsed account when no account is currently selected', () => {
    expect(resolveBasecampTodolistUrl(parsed, null)).toEqual({
      kind: 'match',
      patch: parsed,
    });
  });

  it('keeps the current account when it matches the parsed account', () => {
    expect(resolveBasecampTodolistUrl(parsed, '1234567')).toEqual({
      kind: 'match',
      patch: parsed,
    });
  });

  it('rejects the URL when the current account does not match the parsed account', () => {
    expect(resolveBasecampTodolistUrl(parsed, '9999999')).toEqual({
      kind: 'account-mismatch',
      currentAccountId: '9999999',
      parsedAccountId: '1234567',
    });
  });
});
