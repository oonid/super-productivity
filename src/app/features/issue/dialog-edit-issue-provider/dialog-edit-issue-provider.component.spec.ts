import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { FieldType, FormlyModule } from '@ngx-formly/core';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { DialogEditIssueProviderComponent } from './dialog-edit-issue-provider.component';
import { IssueProviderBasecamp } from '../issue.model';
import { BasecampOAuthFlowService } from '../providers/basecamp/basecamp-oauth-flow.service';
import { PluginIssueProviderRegistryService } from '../../../plugins/issue-provider/plugin-issue-provider-registry.service';
import { PluginBridgeService } from '../../../plugins/plugin-bridge.service';
import { PluginHttpService } from '../../../plugins/issue-provider/plugin-http.service';
import { IssueService } from '../issue.service';
import { SnackService } from '../../../core/snack/snack.service';
import { TaskService } from '../../tasks/task.service';
import { TagService } from '../../tag/tag.service';
import { T } from '../../../t.const';

@Component({ selector: 'noop-formly-field', template: '', standalone: true })
class NoopFormlyFieldComponent extends FieldType {}

describe('DialogEditIssueProviderComponent', () => {
  const TYPE_STUBS = [
    'input',
    'select',
    'checkbox',
    'textarea',
    'btn',
    'collapsible',
  ].map((name) => ({ name, component: NoopFormlyFieldComponent }));
  let component: DialogEditIssueProviderComponent;
  let fixture: ComponentFixture<DialogEditIssueProviderComponent>;
  let basecampOAuthFlowService: jasmine.SpyObj<BasecampOAuthFlowService>;
  let snackService: jasmine.SpyObj<SnackService>;

  beforeEach(async () => {
    basecampOAuthFlowService = jasmine.createSpyObj<BasecampOAuthFlowService>(
      'BasecampOAuthFlowService',
      ['connect', 'discoverAccounts'],
    );
    snackService = jasmine.createSpyObj<SnackService>('SnackService', ['open']);

    const pluginRegistry = jasmine.createSpyObj<PluginIssueProviderRegistryService>(
      'PluginIssueProviderRegistryService',
      ['hasProvider', 'getUseAgendaView', 'getProvider'],
    );
    pluginRegistry.hasProvider.and.returnValue(false);
    pluginRegistry.getUseAgendaView.and.returnValue(false);
    pluginRegistry.getProvider.and.returnValue(undefined);

    const pluginBridge = jasmine.createSpyObj<PluginBridgeService>(
      'PluginBridgeService',
      ['restoreAndCheckOAuthTokens', 'clearOAuthTokens', 'startOAuthFlow'],
    );
    pluginBridge.restoreAndCheckOAuthTokens.and.resolveTo(false);

    const pluginHttp = jasmine.createSpyObj<PluginHttpService>('PluginHttpService', [
      'createHttpHelper',
    ]);

    const issueService = jasmine.createSpyObj<IssueService>('IssueService', [
      'testConnection',
    ]);

    const taskService = jasmine.createSpyObj<TaskService>('TaskService', ['add'], {
      allTasks$: of([]),
    });

    const tagService = jasmine.createSpyObj<TagService>('TagService', ['addTag'], {
      tagsNoMyDayAndNoList$: of([]),
    });
    tagService.addTag.and.returnValue('tag-1');

    await TestBed.configureTestingModule({
      imports: [
        DialogEditIssueProviderComponent,
        NoopFormlyFieldComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot(),
        FormlyModule.forRoot({ types: TYPE_STUBS }),
      ],
      providers: [
        provideMockStore({ initialState: {} }),
        { provide: MAT_DIALOG_DATA, useValue: { issueProviderKey: 'BASECAMP' } },
        {
          provide: MatDialogRef,
          useValue: jasmine.createSpyObj('MatDialogRef', ['close']),
        },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        { provide: PluginIssueProviderRegistryService, useValue: pluginRegistry },
        { provide: PluginBridgeService, useValue: pluginBridge },
        { provide: PluginHttpService, useValue: pluginHttp },
        { provide: IssueService, useValue: issueService },
        { provide: SnackService, useValue: snackService },
        { provide: TaskService, useValue: taskService },
        { provide: TagService, useValue: tagService },
        { provide: BasecampOAuthFlowService, useValue: basecampOAuthFlowService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogEditIssueProviderComponent);
    component = fixture.componentInstance;
    component.form.addControl('accessToken', new FormControl(null));
    component.form.addControl('selectedAccountId', new FormControl(null));
    component.form.addControl('accountId', new FormControl(null));
    spyOn<any>(component, '_refreshFormlyBindings').and.callFake(() => undefined);
  });

  it('updates the live form state and account options after Basecamp connect succeeds', async () => {
    basecampOAuthFlowService.connect.and.resolveTo({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      tokenExpiresAt: 123456789,
    });
    basecampOAuthFlowService.discoverAccounts.and.resolveTo([
      { id: '1', name: 'Primary' },
    ]);

    const connectField = component.fields.find(
      (field: any) =>
        field.type === 'btn' && field.templateOptions?.text === T.F.BASECAMP.FORM.CONNECT,
    ) as any;

    await connectField.templateOptions.onClick();

    const model = component.model as Partial<IssueProviderBasecamp>;
    expect(model.accessToken).toBe('access-1');
    expect(model.refreshToken).toBe('refresh-1');
    expect(model.tokenExpiresAt).toBe(123456789);
    expect(model.accountId).toBe('1');
    expect(model.selectedAccountId).toBe('1');

    expect(component.form.get('accessToken')?.value as unknown).toBe('access-1');
    expect(component.form.get('selectedAccountId')?.value as unknown).toBe('1');
    expect(component.form.get('accountId')?.value as unknown).toBe('1');

    const accountField = component.fields.find(
      (field: any) => field.key === 'selectedAccountId',
    ) as any;
    expect(accountField.templateOptions.options).toEqual([
      { value: '1', label: 'Primary (1)' },
    ]);
    expect(snackService.open).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: 'SUCCESS',
        msg: T.F.BASECAMP.S.CONNECT_SUCCESS,
      }),
    );
  });
});
