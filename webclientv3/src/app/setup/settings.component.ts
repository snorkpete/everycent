import { Component, OnInit } from "@angular/core";
import { BankAccountData } from "../bank-accounts/bank-account.model";
import { BankAccountService } from "../bank-accounts/bank-account.service";
import { MessageService } from "../message-display/message.service";
import { MainToolbarService } from "../shared/main-toolbar/main-toolbar.service";
import { SettingsData } from "../shared/settings-data.model";
import { SettingsService } from "../shared/settings.service";
import { AllocationCategoryData } from "../shared/allocation-category-data.model";
import { AllocationCategoryService } from "../shared/allocation-category.service";

@Component({
  selector: "ec-settings",
  template: `
    <mat-card class="main">
      <mat-card>
        <mat-card-title>Settings</mat-card-title>
        <mat-card-content>
          <ec-list-field
            [editMode]="editMode"
            [items]="bankAccounts"
            placeholder="Primary Budget Account"
            [(ngModel)]="settings.primary_budget_account_id"
          >
          </ec-list-field>

          <ec-list-field
            [editMode]="editMode"
            [items]="allocationCategories"
            placeholder="Default Allocation Category for Special Events"
            [(ngModel)]="settings.default_allocation_category_id_for_special_events"
          >
          </ec-list-field>

          <ng-container *ngIf="editMode; else displayFamilyType">
            <mat-form-field>
              <mat-select
                [(ngModel)]="settings.family_type"
                placeholder="Type of Household"
              >
                <mat-option
                  *ngFor="let option of familyTypeOptions"
                  [value]="option.value"
                  >{{ option.text }}</mat-option
                >
              </mat-select>
            </mat-form-field>
          </ng-container>

          <ng-template #displayFamilyType>
            <span class="text-display">
              <span class="label">Type of Household</span>
              <span class="value">{{ settings.family_type }}</span>
            </span>
          </ng-template>

          <ng-container
            *ngIf="settings.family_type === 'single'; else coupleFields"
          >
            <ec-text-field
              [editMode]="editMode"
              [(ngModel)]="settings.single_person"
              placeholder="Person's Name"
            >
            </ec-text-field>
          </ng-container>

          <ng-template #coupleFields>
            <ec-text-field
              [editMode]="editMode"
              [(ngModel)]="settings.husband"
              placeholder="Husband's Name"
            >
            </ec-text-field>
            <ec-text-field
              [editMode]="editMode"
              [(ngModel)]="settings.wife"
              placeholder="Wife's Name"
            >
            </ec-text-field>
          </ng-template>
        </mat-card-content>
        <mat-card-actions>
          <ec-edit-actions
            [(editMode)]="editMode"
            (save)="saveSettings()"
            (cancel)="refresh()"
          >
          </ec-edit-actions>
        </mat-card-actions>
      </mat-card>
    </mat-card>
  `,
  styles: [
    `
      ::ng-deep .text-display {
        margin-bottom: 20px;
      }
      /* TODO: figure out how to not need this here */
      .value {
        width: 100%;
        font-size: 12px;
        font-family: Roboto, "Helvetica Neue", sans-serif;
      }
      :host.form mat-form-field,
      :host.form .value {
        height: 35px;
        margin-top: 10px;
        margin-bottom: 20px;
        font-size: 16px;
      }
      .text-display {
        display: flex;
        flex-direction: column;
      }
      .label {
        font-size: 12px;
        font-weight: 400;
        line-height: 1.125;
        color: rgba(0, 0, 0, 0.54);
        font-family: Roboto, "Helvetica Neue", sans-serif;
      }
    `
  ]
})
export class SettingsComponent implements OnInit {
  settings: SettingsData = { family_type: "couple" };
  bankAccounts: BankAccountData[] = [];
  allocationCategories: AllocationCategoryData[] = [];
  editMode = false;

  familyTypeOptions = [
    { value: "single", text: "Single" },
    { value: "couple", text: "Couple" }
  ];

  constructor(
    private toolbarService: MainToolbarService,
    private messageService: MessageService,
    private settingsService: SettingsService,
    private bankAccountService: BankAccountService,
    private allocationCategoryService: AllocationCategoryService
  ) {}

  ngOnInit() {
    this.toolbarService.setHeading("General Settings");
    this.bankAccountService
      .getBankAccounts()
      .subscribe(bankAccounts => (this.bankAccounts = bankAccounts));
    this.allocationCategoryService
      .getAllocationCategories()
      .subscribe(categories => (this.allocationCategories = categories));
    this.refresh();
  }

  refresh() {
    this.settingsService.getSettings().subscribe(newSettings => {
      this.settings = newSettings;
    });
  }

  saveSettings() {
    this.settingsService.saveSettings(this.settings).subscribe(
      () => {
        this.messageService.setMessage("Settings saved.");
        this.editMode = false;
      },
      error => {
        this.messageService.setErrorMessage("Settings not saved.");
      }
    );
  }
}
