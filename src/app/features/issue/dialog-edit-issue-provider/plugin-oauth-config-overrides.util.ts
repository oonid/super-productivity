import { OAuthFlowConfig } from '@super-productivity/plugin-api';

/**
 * Apply a plugin's user-supplied OAuth overrides (clientId / clientSecret / redirectUri)
 * from its synced pluginConfig onto the plugin's declared oauthConfig.
 *
 * WARNING: a clientSecret read here comes from the synced IssueProvider.pluginConfig
 * (op-log + backups; may be unencrypted on some sync backends) — like existing provider
 * passwords (Jira/CalDAV/Nextcloud), and unlike OAuth tokens which are kept local-only.
 * Plugins that expose a clientSecret field should warn users in the field help text and use
 * only credentials documented as non-confidential (installed/native-app style).
 */
export const applyPluginOAuthOverrides = (
  oauthConfig: OAuthFlowConfig,
  pluginConfig: Record<string, unknown> | undefined,
): OAuthFlowConfig => {
  const clientId =
    typeof pluginConfig?.['clientId'] === 'string' ? pluginConfig['clientId'].trim() : '';
  const clientSecret =
    typeof pluginConfig?.['clientSecret'] === 'string'
      ? pluginConfig['clientSecret'].trim()
      : '';
  const redirectUri =
    typeof pluginConfig?.['redirectUri'] === 'string'
      ? pluginConfig['redirectUri'].trim()
      : '';

  return {
    ...oauthConfig,
    ...(clientId ? { clientId } : {}),
    ...(clientSecret ? { clientSecret } : {}),
    ...(redirectUri ? { redirectUri } : {}),
  };
};
