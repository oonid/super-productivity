import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { IssueProviderSetupOverviewComponent } from './issue-provider-setup-overview.component';
import { selectEnabledIssueProviders } from '../../issue/store/issue-provider.selectors';
import { PluginIssueProviderRegistryService } from '../../../plugins/issue-provider/plugin-issue-provider-registry.service';
import { PluginService } from '../../../plugins/plugin.service';

describe('IssueProviderSetupOverviewComponent', () => {
  let fixture: ComponentFixture<IssueProviderSetupOverviewComponent>;
  let matDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    matDialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);

    TestBed.configureTestingModule({
      imports: [IssueProviderSetupOverviewComponent, TranslateModule.forRoot()],
      providers: [
        provideMockStore({
          selectors: [{ selector: selectEnabledIssueProviders, value: [] }],
        }),
        { provide: MatDialog, useValue: matDialog },
        {
          provide: PluginIssueProviderRegistryService,
          useValue: { getAvailableProviders: () => [] },
        },
        {
          provide: PluginService,
          useValue: { getDisabledIssueProviderPlugins: () => [] },
        },
      ],
    });

    fixture = TestBed.createComponent(IssueProviderSetupOverviewComponent);
    fixture.detectChanges();
  });

  const findBasecampTile = (): HTMLButtonElement | undefined =>
    Array.from(fixture.nativeElement.querySelectorAll('button.provider-tile')).find(
      (btn) => (btn as HTMLElement).textContent?.trim() === 'Basecamp',
    ) as HTMLButtonElement | undefined;

  it('renders a Basecamp tile in the setup panel', () => {
    expect(findBasecampTile()).toBeTruthy();
  });

  it('opens the setup dialog for BASECAMP when the tile is clicked', () => {
    const tile = findBasecampTile();
    expect(tile).toBeTruthy();
    tile!.click();
    expect(matDialog.open).toHaveBeenCalledWith(
      jasmine.anything(),
      jasmine.objectContaining({
        data: jasmine.objectContaining({ issueProviderKey: 'BASECAMP' }),
      }),
    );
  });
});
