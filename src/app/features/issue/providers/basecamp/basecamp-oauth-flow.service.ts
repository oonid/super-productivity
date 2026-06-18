import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { generateCodeVerifier } from '@sp/sync-providers/pkce';
import { PluginOAuthService } from '../../../../plugins/oauth/plugin-oauth.service';
import {
  BASECAMP_LAUNCHPAD_CLIENT_ID,
  BASECAMP_LAUNCHPAD_CLIENT_SECRET,
  BASECAMP_LAUNCHPAD_REDIRECT_URI,
  BASECAMP_LAUNCHPAD_TOKEN_URL,
  BASECAMP_LAUNCHPAD_AUTHORIZATION_URL,
} from './basecamp.const';
import { buildBasecampAuthorizeUrl } from './basecamp-oauth-authorize';
import { generateBasecampPkcePair } from './basecamp-oauth-pkce';
import { BasecampAccount, parseBasecampAccounts } from './basecamp-account-discovery';

const BASECAMP_LOOPBACK_PORT = 8976;
const BASECAMP_OAUTH_FLOW_KEY = 'BASECAMP';

export interface BasecampAuthorizationCodeResult {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}

export interface BasecampOAuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: number;
}

interface BasecampTokenExchangeResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

@Injectable({ providedIn: 'root' })
export class BasecampOAuthFlowService {
  private _http = inject(HttpClient);
  private _pluginOAuthService = inject(PluginOAuthService);

  async startAuthorizationCodeFlow(): Promise<BasecampAuthorizationCodeResult> {
    if (!window.ea?.pluginOAuthPrepare || !window.ea?.pluginOAuthStart) {
      throw new Error('Basecamp OAuth currently requires the Electron app runtime');
    }

    const { port } = await window.ea.pluginOAuthPrepare(BASECAMP_LOOPBACK_PORT);
    if (port !== BASECAMP_LOOPBACK_PORT) {
      throw new Error(
        `Basecamp OAuth callback must bind to port ${BASECAMP_LOOPBACK_PORT}`,
      );
    }

    const { codeVerifier, codeChallenge } = await generateBasecampPkcePair();
    const state = generateCodeVerifier();
    const redirectUri = BASECAMP_LAUNCHPAD_REDIRECT_URI;
    const authorizationUrl = buildBasecampAuthorizeUrl({
      state,
      codeChallenge,
      redirectUri,
    });

    const codePromise = this._pluginOAuthService.waitForRedirectCode(
      BASECAMP_OAUTH_FLOW_KEY,
      state,
    );
    window.ea.pluginOAuthStart(authorizationUrl);
    const code = await codePromise;

    return {
      code,
      codeVerifier,
      redirectUri,
    };
  }

  async exchangeAuthorizationCode(
    authCode: BasecampAuthorizationCodeResult,
  ): Promise<BasecampOAuthTokens> {
    const body = new URLSearchParams({
      type: 'web_server',
      client_id: BASECAMP_LAUNCHPAD_CLIENT_ID,
      client_secret: BASECAMP_LAUNCHPAD_CLIENT_SECRET,
      code: authCode.code,
      code_verifier: authCode.codeVerifier,
      redirect_uri: authCode.redirectUri,
    }).toString();

    const response = await firstValueFrom(
      this._http.post<BasecampTokenExchangeResponse>(BASECAMP_LAUNCHPAD_TOKEN_URL, body, {
        headers: new HttpHeaders().set(
          'Content-Type',
          'application/x-www-form-urlencoded',
        ),
      }),
    );

    return this._parseTokenExchangeResponse(response);
  }

  /** Run the full login flow and return the token patch the caller persists to BasecampCfg. */
  async connect(): Promise<BasecampOAuthTokens> {
    const authCode = await this.startAuthorizationCodeFlow();
    return this.exchangeAuthorizationCode(authCode);
  }

  /** Fetch the user's Basecamp accounts from launchpad authorization.json, keeping only BC3 accounts. */
  async discoverAccounts(accessToken: string): Promise<BasecampAccount[]> {
    const response = await firstValueFrom(
      this._http.get<unknown>(BASECAMP_LAUNCHPAD_AUTHORIZATION_URL, {
        headers: new HttpHeaders()
          .set('Authorization', `Bearer ${accessToken}`)
          .set('Accept', 'application/json'),
      }),
    );
    return parseBasecampAccounts(response);
  }

  /** Refresh the access token. Launchpad refresh may omit refresh_token; keep the old one then. */
  async refresh(refreshToken: string): Promise<BasecampOAuthTokens> {
    const body = new URLSearchParams({
      type: 'refresh',
      refresh_token: refreshToken,
      client_id: BASECAMP_LAUNCHPAD_CLIENT_ID,
      client_secret: BASECAMP_LAUNCHPAD_CLIENT_SECRET,
    }).toString();

    const response = await firstValueFrom(
      this._http.post<Partial<BasecampTokenExchangeResponse>>(
        BASECAMP_LAUNCHPAD_TOKEN_URL,
        body,
        {
          headers: new HttpHeaders().set(
            'Content-Type',
            'application/x-www-form-urlencoded',
          ),
        },
      ),
    );

    return this._parseRefreshResponse(response, refreshToken);
  }

  private _parseTokenExchangeResponse(
    response: BasecampTokenExchangeResponse,
  ): BasecampOAuthTokens {
    if (typeof response.access_token !== 'string' || response.access_token.length === 0) {
      throw new Error('Basecamp token exchange did not return an access_token');
    }
    if (
      typeof response.refresh_token !== 'string' ||
      response.refresh_token.length === 0
    ) {
      throw new Error('Basecamp token exchange did not return a refresh_token');
    }
    if (
      typeof response.expires_in !== 'number' ||
      !Number.isFinite(response.expires_in)
    ) {
      throw new Error('Basecamp token exchange did not return a valid expires_in');
    }

    const expiresInMs = response.expires_in * 1000;
    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      tokenExpiresAt: Date.now() + expiresInMs,
    };
  }

  private _parseRefreshResponse(
    response: Partial<BasecampTokenExchangeResponse>,
    fallbackRefreshToken: string,
  ): BasecampOAuthTokens {
    if (typeof response.access_token !== 'string' || response.access_token.length === 0) {
      throw new Error('Basecamp token refresh did not return an access_token');
    }
    if (
      typeof response.expires_in !== 'number' ||
      !Number.isFinite(response.expires_in)
    ) {
      throw new Error('Basecamp token refresh did not return a valid expires_in');
    }
    const refreshToken =
      typeof response.refresh_token === 'string' && response.refresh_token.length > 0
        ? response.refresh_token
        : fallbackRefreshToken;
    const expiresInMs = response.expires_in * 1000;
    return {
      accessToken: response.access_token,
      refreshToken,
      tokenExpiresAt: Date.now() + expiresInMs,
    };
  }
}
