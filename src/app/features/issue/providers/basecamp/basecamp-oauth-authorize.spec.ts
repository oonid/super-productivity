import {
  buildBasecampAuthorizeUrl,
  BASECAMP_LAUNCHPAD_AUTHORIZATION_URL,
} from './basecamp-oauth-authorize';
import {
  BASECAMP_LAUNCHPAD_CLIENT_ID,
  BASECAMP_LAUNCHPAD_REDIRECT_URI,
} from './basecamp.const';

describe('basecamp oauth authorize helper', () => {
  it('builds the launchpad authorize URL for the fixed loopback callback', () => {
    const result = buildBasecampAuthorizeUrl({
      state: 'state-123',
      codeChallenge: 'challenge-456',
    });

    const url = new URL(result);
    expect(url.origin + url.pathname).toBe(BASECAMP_LAUNCHPAD_AUTHORIZATION_URL);
    expect(url.searchParams.get('type')).toBe('web_server');
    expect(url.searchParams.get('client_id')).toBe(BASECAMP_LAUNCHPAD_CLIENT_ID);
    expect(url.searchParams.get('redirect_uri')).toBe(BASECAMP_LAUNCHPAD_REDIRECT_URI);
    expect(url.searchParams.get('code_challenge')).toBe('challenge-456');
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(url.searchParams.get('state')).toBe('state-123');
  });

  it('allows overriding redirect URI and client id', () => {
    const result = buildBasecampAuthorizeUrl({
      state: 'override-state',
      codeChallenge: 'override-challenge',
      redirectUri: 'http://127.0.0.1:9999/callback',
      clientId: 'override-client-id',
    });

    const url = new URL(result);
    expect(url.searchParams.get('redirect_uri')).toBe('http://127.0.0.1:9999/callback');
    expect(url.searchParams.get('client_id')).toBe('override-client-id');
  });

  it('rejects non-https authorization endpoints', () => {
    expect(() =>
      buildBasecampAuthorizeUrl({
        state: 'state-123',
        codeChallenge: 'challenge-456',
        authorizationUrl: 'http://launchpad.37signals.com/authorization/new',
      }),
    ).toThrowError('Basecamp authorization URL must use HTTPS');
  });
});
