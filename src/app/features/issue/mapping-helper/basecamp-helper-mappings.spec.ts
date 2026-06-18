import { SearchResultItem, IssueProviderBasecamp } from '../issue.model';
import { getIssueProviderHelpLink } from './get-issue-provider-help-link';
import {
  getIssueProviderInitials,
  getIssueProviderTooltip,
} from './get-issue-provider-tooltip';
import { isIssueDone } from './is-issue-done';

describe('Basecamp helper mappings', () => {
  const provider: IssueProviderBasecamp = {
    id: 'provider-basecamp-1',
    issueProviderKey: 'BASECAMP',
    isEnabled: true,
    accessToken: 'token',
    accountId: '123456',
    bucketId: 'Client Ops',
    todolistId: '777',
    isAutoPoll: true,
    isAutoAddToBacklog: false,
    timeTracking: 'both',
  };

  it('uses completed state for done detection', () => {
    const doneIssue = {
      title: 'Done todo',
      issueType: 'BASECAMP',
      issueData: {
        id: 1,
        content: 'Done todo',
        completed: true,
      },
    } as unknown as SearchResultItem;

    const openIssue = {
      title: 'Open todo',
      issueType: 'BASECAMP',
      issueData: {
        id: 2,
        content: 'Open todo',
        completed: false,
      },
    } as unknown as SearchResultItem;

    expect(isIssueDone(doneIssue)).toBeTrue();
    expect(isIssueDone(openIssue)).toBeFalse();
  });

  it('uses bucketId for tooltip text', () => {
    expect(getIssueProviderTooltip(provider)).toBe('Client Ops');
  });

  it('falls back to the provider key when bucketId is missing', () => {
    expect(getIssueProviderTooltip({ ...provider, bucketId: null })).toBe('BASECAMP');
  });

  it('derives initials from bucketId with a Basecamp fallback', () => {
    expect(getIssueProviderInitials(provider)).toBe('CL');
    expect(getIssueProviderInitials({ ...provider, bucketId: null })).toBe('BC');
  });

  it('links Basecamp help to the BC3 API reference', () => {
    expect(getIssueProviderHelpLink('BASECAMP')).toBe(
      'https://github.com/basecamp/bc3-api',
    );
  });
});
