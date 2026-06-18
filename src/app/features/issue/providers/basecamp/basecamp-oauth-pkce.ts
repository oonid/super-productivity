import { generatePKCECodes } from '@sp/sync-providers/pkce';

export const BASECAMP_PKCE_METHOD = 'S256';

export interface BasecampPkcePair {
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: typeof BASECAMP_PKCE_METHOD;
}

export const generateBasecampPkcePair = async (): Promise<BasecampPkcePair> => {
  const { codeVerifier, codeChallenge } = await generatePKCECodes();
  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: BASECAMP_PKCE_METHOD,
  };
};
