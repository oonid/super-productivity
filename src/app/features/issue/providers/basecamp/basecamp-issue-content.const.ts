import { T } from '../../../../t.const';
import {
  IssueContentConfig,
  IssueFieldType,
} from '../../issue-content/issue-content.model';
import { IssueProviderKey } from '../../issue.model';
import { BasecampTodo } from './basecamp-issue.model';

export const BASECAMP_ISSUE_CONTENT_CONFIG: IssueContentConfig<BasecampTodo> = {
  issueType: 'BASECAMP' as IssueProviderKey,
  fields: [
    {
      label: T.F.ISSUE.ISSUE_CONTENT.SUMMARY,
      type: IssueFieldType.LINK,
      value: (issue: BasecampTodo) => issue.content,
      getLink: (issue: BasecampTodo) => issue.app_url || issue.url || '',
    },
    {
      label: T.F.ISSUE.ISSUE_CONTENT.STATUS,
      type: IssueFieldType.TEXT,
      value: (issue: BasecampTodo) => (issue.completed ? 'Completed' : 'Open'),
    },
    {
      label: T.F.ISSUE.ISSUE_CONTENT.DUE_DATE,
      type: IssueFieldType.TEXT,
      value: (issue: BasecampTodo) => issue.due_on,
      isVisible: (issue: BasecampTodo) => !!issue.due_on,
    },
    {
      label: T.F.ISSUE.ISSUE_CONTENT.DESCRIPTION,
      type: IssueFieldType.MARKDOWN,
      value: (issue: BasecampTodo) => issue.description,
      isVisible: (issue: BasecampTodo) => !!issue.description,
    },
  ],
  getIssueUrl: (issue: BasecampTodo) => issue.app_url || issue.url || '',
};
