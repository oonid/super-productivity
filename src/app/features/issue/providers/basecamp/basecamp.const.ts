import { getEnvOptional } from '../../../../util/env';

export {
  BASECAMP_CONFIG_FORM,
  BASECAMP_CONFIG_FORM_SECTION,
  BASECAMP_TIME_TRACKING_OPTIONS,
  DEFAULT_BASECAMP_CFG,
} from './basecamp-cfg-form.const';

// OAuth client metadata for the native Basecamp integration.
// Register a Basecamp app at https://launchpad.37signals.com/integrations, then put
// BASECAMP_CLIENT_ID / BASECAMP_CLIENT_SECRET in your (gitignored) .env file.
// The placeholders below keep builds green for anyone who hasn't set up an app.
// For installed/native apps the "secret" is not confidential (PKCE), so it ships in the build.
export const BASECAMP_LAUNCHPAD_CLIENT_ID =
  getEnvOptional('BASECAMP_CLIENT_ID') ?? 'YOUR_BASECAMP_CLIENT_ID';
export const BASECAMP_LAUNCHPAD_CLIENT_SECRET =
  getEnvOptional('BASECAMP_CLIENT_SECRET') ?? 'YOUR_BASECAMP_CLIENT_SECRET';
export const BASECAMP_LAUNCHPAD_REDIRECT_URI = 'http://127.0.0.1:8976/callback';
export const BASECAMP_LAUNCHPAD_TOKEN_URL =
  'https://launchpad.37signals.com/authorization/token';
export const BASECAMP_LAUNCHPAD_AUTHORIZATION_URL =
  'https://launchpad.37signals.com/authorization.json';

export const BASECAMP_POLL_INTERVAL = 5 * 60 * 1000;
export const BASECAMP_INITIAL_POLL_DELAY = 8 * 1000;
