import { generateCodeChallenge } from '@sp/sync-providers/pkce';
import { BASECAMP_PKCE_METHOD, generateBasecampPkcePair } from './basecamp-oauth-pkce';

describe('basecamp oauth pkce helper', () => {
  it('returns a verifier and matching S256 challenge pair', async () => {
    const result = await generateBasecampPkcePair();

    expect(result.codeVerifier).toEqual(jasmine.any(String));
    expect(result.codeVerifier.length).toBeGreaterThan(20);
    expect(result.codeChallengeMethod).toBe(BASECAMP_PKCE_METHOD);
    await expectAsync(generateCodeChallenge(result.codeVerifier)).toBeResolvedTo(
      result.codeChallenge,
    );
  });
});
