import {
  BASECAMP_LAUNCHPAD_CLIENT_ID,
  BASECAMP_LAUNCHPAD_REDIRECT_URI,
} from './basecamp.const';
import { BASECAMP_PKCE_METHOD } from './basecamp-oauth-pkce';

export const BASECAMP_LAUNCHPAD_AUTHORIZATION_URL =
  'https://launchpad.37signals.com/authorization/new';

export interface BuildBasecampAuthorizeUrlParams {
  state: string;
  codeChallenge: string;
  redirectUri?: string;
  clientId?: string;
  authorizationUrl?: string;
}

export const buildBasecampAuthorizeUrl = (
  params: BuildBasecampAuthorizeUrlParams,
): string => {
  const {
    state,
    codeChallenge,
    redirectUri = BASECAMP_LAUNCHPAD_REDIRECT_URI,
    clientId = BASECAMP_LAUNCHPAD_CLIENT_ID,
    authorizationUrl = BASECAMP_LAUNCHPAD_AUTHORIZATION_URL,
  } = params;

  const url = new URL(authorizationUrl);
  if (url.protocol !== 'https:') {
    throw new Error('Basecamp authorization URL must use HTTPS');
  }

  url.searchParams.set('type', 'web_server');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('code_challenge_method', BASECAMP_PKCE_METHOD);
  url.searchParams.set('state', state);

  return url.toString();
};
