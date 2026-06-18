import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { BasecampOAuthFlowService } from './basecamp-oauth-flow.service';
import { PluginOAuthService } from '../../../../plugins/oauth/plugin-oauth.service';
import {
  BASECAMP_LAUNCHPAD_CLIENT_ID,
  BASECAMP_LAUNCHPAD_CLIENT_SECRET,
  BASECAMP_LAUNCHPAD_REDIRECT_URI,
  BASECAMP_LAUNCHPAD_TOKEN_URL,
  BASECAMP_LAUNCHPAD_AUTHORIZATION_URL,
} from './basecamp.const';

const ORIGINAL_EA = window.ea;

describe('BasecampOAuthFlowService', () => {
  let service: BasecampOAuthFlowService;
  let httpMock: HttpTestingController;
  let pluginOAuthService: jasmine.SpyObj<PluginOAuthService>;
  let pluginOAuthPrepare: jasmine.Spy;
  let pluginOAuthStart: jasmine.Spy;

  beforeEach(() => {
    pluginOAuthService = jasmine.createSpyObj<PluginOAuthService>(
      'PluginOAuthService',
      ['waitForRedirectCode'],
      { tokenInvalidated$: new Subject<string>() },
    );

    pluginOAuthPrepare = jasmine
      .createSpy('pluginOAuthPrepare')
      .and.resolveTo({ port: 8976 });
    pluginOAuthStart = jasmine.createSpy('pluginOAuthStart');
    window.ea = {
      ...(window.ea ?? {}),
      pluginOAuthPrepare,
      pluginOAuthStart,
    } as typeof window.ea;

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        BasecampOAuthFlowService,
        { provide: PluginOAuthService, useValue: pluginOAuthService },
      ],
    });
    service = TestBed.inject(BasecampOAuthFlowService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    window.ea = ORIGINAL_EA as typeof window.ea;
  });

  it('prepares the fixed loopback callback, opens launchpad, and resolves the auth code', async () => {
    pluginOAuthService.waitForRedirectCode.and.resolveTo('auth-code-123');

    const result = await service.startAuthorizationCodeFlow();

    expect(pluginOAuthPrepare).toHaveBeenCalledOnceWith(8976);
    expect(pluginOAuthService.waitForRedirectCode).toHaveBeenCalledWith(
      'BASECAMP',
      jasmine.any(String),
    );
    expect(pluginOAuthStart).toHaveBeenCalledOnceWith(jasmine.any(String));

    const openedUrl = new URL(pluginOAuthStart.calls.mostRecent().args[0] as string);
    expect(openedUrl.searchParams.get('redirect_uri')).toBe(
      BASECAMP_LAUNCHPAD_REDIRECT_URI,
    );
    expect(openedUrl.searchParams.get('type')).toBe('web_server');
    expect(openedUrl.searchParams.get('code_challenge')).toBeTruthy();
    expect(openedUrl.searchParams.get('code_challenge_method')).toBe('S256');
    expect(openedUrl.searchParams.get('state')).toBe(
      pluginOAuthService.waitForRedirectCode.calls.mostRecent().args[1] as string,
    );

    expect(result.code).toBe('auth-code-123');
    expect(result.codeVerifier).toEqual(jasmine.any(String));
    expect(result.redirectUri).toBe(BASECAMP_LAUNCHPAD_REDIRECT_URI);
  });

  it('exchanges the authorization code for access and refresh tokens', async () => {
    spyOn(Date, 'now').and.returnValue(1_000_000);

    const promise = service.exchangeAuthorizationCode({
      code: 'auth-code-123',
      codeVerifier: 'verifier-xyz',
      redirectUri: BASECAMP_LAUNCHPAD_REDIRECT_URI,
    });

    const req = httpMock.expectOne(BASECAMP_LAUNCHPAD_TOKEN_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Content-Type')).toBe(
      'application/x-www-form-urlencoded',
    );

    const body = new URLSearchParams(req.request.body as string);
    expect(body.get('type')).toBe('web_server');
    expect(body.get('client_id')).toBe(BASECAMP_LAUNCHPAD_CLIENT_ID);
    expect(body.get('client_secret')).toBe(BASECAMP_LAUNCHPAD_CLIENT_SECRET);
    expect(body.get('code')).toBe('auth-code-123');
    expect(body.get('code_verifier')).toBe('verifier-xyz');
    expect(body.get('redirect_uri')).toBe(BASECAMP_LAUNCHPAD_REDIRECT_URI);
    req.flush({
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
      expires_in: 3600,
    });

    await expectAsync(promise).toBeResolvedTo({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      tokenExpiresAt: 1_000_000 + 3_600_000,
    });
  });

  it('rejects when the loopback server binds a different port', async () => {
    pluginOAuthPrepare.and.resolveTo({ port: 8999 });

    await expectAsync(service.startAuthorizationCodeFlow()).toBeRejectedWithError(
      'Basecamp OAuth callback must bind to port 8976',
    );
    expect(pluginOAuthStart).not.toHaveBeenCalled();
  });

  it('rejects invalid token responses that omit refresh_token', async () => {
    const promise = service.exchangeAuthorizationCode({
      code: 'auth-code-123',
      codeVerifier: 'verifier-xyz',
      redirectUri: BASECAMP_LAUNCHPAD_REDIRECT_URI,
    });

    const req = httpMock.expectOne(BASECAMP_LAUNCHPAD_TOKEN_URL);
    req.flush({
      access_token: 'new-access-token',
      expires_in: 3600,
    });

    await expectAsync(promise).toBeRejectedWithError(
      'Basecamp token exchange did not return a refresh_token',
    );
  });

  it('connect() composes the flow and returns the token patch persisted to config', async () => {
    const authCode = {
      code: 'auth-code-123',
      codeVerifier: 'verifier-xyz',
      redirectUri: BASECAMP_LAUNCHPAD_REDIRECT_URI,
    };
    const tokens = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      tokenExpiresAt: 4_600_000,
    };
    spyOn(service, 'startAuthorizationCodeFlow').and.resolveTo(authCode);
    spyOn(service, 'exchangeAuthorizationCode').and.resolveTo(tokens);

    await expectAsync(service.connect()).toBeResolvedTo(tokens);
    expect(service.startAuthorizationCodeFlow).toHaveBeenCalledTimes(1);
    expect(service.exchangeAuthorizationCode).toHaveBeenCalledOnceWith(authCode);
  });

  it('refresh() POSTs to the token URL with refresh type and resolves new tokens', async () => {
    spyOn(Date, 'now').and.returnValue(1_000_000);

    const promise = service.refresh('old-refresh');

    const req = httpMock.expectOne(BASECAMP_LAUNCHPAD_TOKEN_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Content-Type')).toBe(
      'application/x-www-form-urlencoded',
    );

    const body = new URLSearchParams(req.request.body as string);
    expect(body.get('type')).toBe('refresh');
    expect(body.get('refresh_token')).toBe('old-refresh');
    expect(body.get('client_id')).toBe(BASECAMP_LAUNCHPAD_CLIENT_ID);
    expect(body.get('client_secret')).toBe(BASECAMP_LAUNCHPAD_CLIENT_SECRET);
    req.flush({
      access_token: 'a2',
      refresh_token: 'r2',
      expires_in: 3600,
    });

    await expectAsync(promise).toBeResolvedTo({
      accessToken: 'a2',
      refreshToken: 'r2',
      tokenExpiresAt: 1_000_000 + 3_600_000,
    });
  });

  it('refresh() keeps the old refresh_token when the response omits it', async () => {
    spyOn(Date, 'now').and.returnValue(2_000_000);

    const promise = service.refresh('old-refresh');

    const req = httpMock.expectOne(BASECAMP_LAUNCHPAD_TOKEN_URL);
    req.flush({
      access_token: 'a3',
      expires_in: 7200,
    });

    await expectAsync(promise).toBeResolvedTo({
      accessToken: 'a3',
      refreshToken: 'old-refresh',
      tokenExpiresAt: 2_000_000 + 7_200_000,
    });
  });

  it('throws when not running in the Electron app runtime', async () => {
    window.ea = undefined as unknown as typeof window.ea;

    await expectAsync(service.startAuthorizationCodeFlow()).toBeRejectedWithError(
      'Basecamp OAuth currently requires the Electron app runtime',
    );
  });

  it('discoverAccounts() fetches authorization.json and filters for BC3 accounts', async () => {
    const promise = service.discoverAccounts('access-1');

    const req = httpMock.expectOne(BASECAMP_LAUNCHPAD_AUTHORIZATION_URL);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer access-1');
    expect(req.request.headers.get('Accept')).toBe('application/json');

    req.flush({
      accounts: [
        { id: 1, name: 'A', product: 'bc3' },
        { id: 2, name: 'B', product: 'bcx' },
      ],
    });

    await expectAsync(promise).toBeResolvedTo([{ id: '1', name: 'A' }]);
  });
});
