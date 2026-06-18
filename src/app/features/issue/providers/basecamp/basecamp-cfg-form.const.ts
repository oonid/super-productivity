import { T } from '../../../../t.const';
import {
  ConfigFormSection,
  LimitedFormlyFieldConfig,
} from '../../../config/global-config.model';
import { ISSUE_PROVIDER_COMMON_FORM_FIELDS } from '../../common-issue-form-stuff.const';
import { IssueProviderBasecamp } from '../../issue.model';
import { BasecampCfg, BasecampTimeTrackingMode } from './basecamp.model';

export const BASECAMP_TIME_TRACKING_OPTIONS: {
  value: BasecampTimeTrackingMode;
  label: string;
}[] = [
  { value: 'off', label: T.F.BASECAMP.FORM.TIME_TRACKING_OFF },
  { value: 'onStop', label: T.F.BASECAMP.FORM.TIME_TRACKING_ON_STOP },
  { value: 'onDone', label: T.F.BASECAMP.FORM.TIME_TRACKING_ON_DONE },
  { value: 'both', label: T.F.BASECAMP.FORM.TIME_TRACKING_BOTH },
];

export const DEFAULT_BASECAMP_CFG: BasecampCfg = {
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
};

export const BASECAMP_CONFIG_FORM: LimitedFormlyFieldConfig<IssueProviderBasecamp>[] = [
  {
    key: 'accessToken',
    type: 'input',
    templateOptions: {
      label: T.F.BASECAMP.FORM.ACCESS_TOKEN,
      type: 'password',
      required: true,
    },
  },
  {
    type: 'btn',
    templateOptions: {
      text: T.F.BASECAMP.FORM.CONNECT,
      btnStyle: 'stroked',
      btnType: 'primary',
      onClick: async () => undefined,
    },
  },
  {
    key: 'selectedAccountId',
    type: 'select',
    templateOptions: {
      label: T.F.BASECAMP.FORM.SELECTED_ACCOUNT,
      description: T.F.BASECAMP.FORM.SELECTED_ACCOUNT_DESC,
      options: [],
    },
  },
  {
    key: 'todolistUrl',
    type: 'input',
    templateOptions: {
      label: T.F.BASECAMP.FORM.TODOLIST_URL,
      type: 'url',
      description: T.F.BASECAMP.FORM.TODOLIST_URL_DESC,
    },
  },
  {
    key: 'accountId',
    type: 'input',
    templateOptions: {
      label: T.F.BASECAMP.FORM.ACCOUNT_ID,
      required: true,
    },
  },
  {
    key: 'bucketId',
    type: 'input',
    templateOptions: {
      label: T.F.BASECAMP.FORM.BUCKET_ID,
      required: true,
    },
  },
  {
    key: 'todolistId',
    type: 'input',
    templateOptions: {
      label: T.F.BASECAMP.FORM.TODOLIST_ID,
      required: true,
    },
  },
  {
    type: 'collapsible',
    props: { label: T.F.BASECAMP.FORM_SECTION.ADVANCED },
    fieldGroup: [
      ...ISSUE_PROVIDER_COMMON_FORM_FIELDS,
      {
        key: 'timeTracking',
        type: 'select',
        defaultValue: 'both',
        templateOptions: {
          label: T.F.BASECAMP.FORM.TIME_TRACKING,
          required: true,
          options: BASECAMP_TIME_TRACKING_OPTIONS,
        },
      },
    ],
  },
];

export const BASECAMP_CONFIG_FORM_SECTION: ConfigFormSection<IssueProviderBasecamp> = {
  title: T.F.BASECAMP.FORM_SECTION.TITLE,
  key: 'BASECAMP',
  items: BASECAMP_CONFIG_FORM,
  help: T.F.BASECAMP.FORM_SECTION.HELP,
};
