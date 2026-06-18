import { BaseIssueProviderCfg } from '../../issue.model';

export type BasecampTimeTrackingMode = 'off' | 'onStop' | 'onDone' | 'both';

export interface BasecampCfg extends BaseIssueProviderCfg {
  accessToken: string | null;
  refreshToken?: string | null;
  tokenExpiresAt?: number | null;
  selectedAccountId?: string | null;
  todolistUrl?: string | null;
  accountId: string | null;
  bucketId: string | null;
  todolistId: string | null;
  isAutoPoll?: boolean;
  isAutoAddToBacklog?: boolean;
  timeTracking: BasecampTimeTrackingMode;
}
