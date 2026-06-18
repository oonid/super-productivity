import {
  BASECAMP_TYPE,
  DEFAULT_ISSUE_PROVIDER_CFGS,
  ISSUE_PROVIDER_FORM_CFGS_MAP,
  ISSUE_PROVIDER_HUMANIZED,
  ISSUE_PROVIDER_ICON_MAP,
  ISSUE_PROVIDER_TYPES,
  ISSUE_STR_MAP,
} from '../../issue.const';
import {
  BASECAMP_CONFIG_FORM,
  BASECAMP_CONFIG_FORM_SECTION,
  BASECAMP_TIME_TRACKING_OPTIONS,
  DEFAULT_BASECAMP_CFG,
} from './basecamp.const';
import { T } from '../../../../t.const';

describe('basecamp provider registration', () => {
  it('registers Basecamp as a built-in provider type with icon and label maps', () => {
    expect(ISSUE_PROVIDER_TYPES).toContain(BASECAMP_TYPE);
    expect(ISSUE_PROVIDER_ICON_MAP[BASECAMP_TYPE]).toBe('basecamp');
    expect(ISSUE_PROVIDER_HUMANIZED[BASECAMP_TYPE]).toBe('Basecamp');
  });

  it('registers Basecamp defaults and config form section in the provider maps', () => {
    expect(DEFAULT_ISSUE_PROVIDER_CFGS[BASECAMP_TYPE]).toBe(DEFAULT_BASECAMP_CFG);
    expect(ISSUE_PROVIDER_FORM_CFGS_MAP[BASECAMP_TYPE]).toBe(
      BASECAMP_CONFIG_FORM_SECTION,
    );
    expect(ISSUE_STR_MAP[BASECAMP_TYPE]).toEqual(
      jasmine.objectContaining({
        ISSUE_STR: jasmine.any(String),
        ISSUES_STR: jasmine.any(String),
      }),
    );
  });

  it('defines the expected Basecamp default config values', () => {
    expect(DEFAULT_BASECAMP_CFG).toEqual({
      isEnabled: false,
      accessToken: null,
      refreshToken: null,
      tokenExpiresAt: null,
      selectedAccountId: null,
      todolistUrl: null,
      accountId: null,
      bucketId: null,
      todolistId: null,
      isAutoPoll: false,
      isAutoAddToBacklog: false,
      timeTracking: 'both',
    });
  });

  it('defines the expected Basecamp config form and time-tracking options', () => {
    expect(BASECAMP_CONFIG_FORM_SECTION.key).toBe('BASECAMP');
    expect(BASECAMP_CONFIG_FORM_SECTION.items).toBe(BASECAMP_CONFIG_FORM);

    expect(BASECAMP_CONFIG_FORM.map((field) => field.key)).toEqual([
      'accessToken',
      undefined,
      'selectedAccountId',
      'todolistUrl',
      'accountId',
      'bucketId',
      'todolistId',
      undefined,
    ]);

    const connectButton = BASECAMP_CONFIG_FORM.find((field) => field.type === 'btn');
    expect(connectButton?.templateOptions).toEqual(
      jasmine.objectContaining({
        text: T.F.BASECAMP.FORM.CONNECT,
        btnStyle: 'stroked',
        btnType: 'primary',
      }),
    );

    const accountPicker = BASECAMP_CONFIG_FORM.find(
      (field) => field.key === 'selectedAccountId',
    );
    expect(accountPicker?.templateOptions).toEqual(
      jasmine.objectContaining({
        label: T.F.BASECAMP.FORM.SELECTED_ACCOUNT,
        options: [],
      }),
    );

    const todolistUrlField = BASECAMP_CONFIG_FORM.find(
      (field) => field.key === 'todolistUrl',
    );
    expect(todolistUrlField?.templateOptions).toEqual(
      jasmine.objectContaining({
        label: T.F.BASECAMP.FORM.TODOLIST_URL,
        type: 'url',
      }),
    );

    expect(BASECAMP_TIME_TRACKING_OPTIONS.map((option) => option.value)).toEqual([
      'off',
      'onStop',
      'onDone',
      'both',
    ]);
  });
});
