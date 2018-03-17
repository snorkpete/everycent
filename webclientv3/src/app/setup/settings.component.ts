import { Component, OnInit } from '@angular/core';
import {BankAccountData} from "../bank-accounts/bank-account.model";
import {BankAccountService} from "../bank-accounts/bank-account.service";
import {MessageService} from "../message-display/message.service";
import {MainToolbarService} from "../shared/main-toolbar/main-toolbar.service";
import {SettingsData} from "../shared/settings-data.model";
import {SettingsService} from "../shared/settings.service";

@Component({
  selector: 'ec-settings',
  template: `
    <mat-card class="main">
      <mat-card>
        <mat-card-title>Settings</mat-card-title>
        <mat-card-content>
          <ec-list-field [(editMode)]="editMode"
                         [items]="bankAccounts"
                         placeholder="Primary Budget Account"
                         [(ngModel)]="settings.primary_budget_account_id"
          >
          </ec-list-field>
          <ec-text-field [(editMode)]="editMode"
                         [(ngModel)]="settings.husband"
                         placeholder="Husband's Name"
          >
          </ec-text-field>
          <ec-text-field [(editMode)]="editMode"
                         [(ngModel)]="settings.wife"
                         placeholder="Wife's Name"
          >
          </ec-text-field>
        </mat-card-content>
        <mat-card-actions>
          <ec-edit-actions [(editMode)]="editMode"
                           (save)="saveSettings()"
                           (cancel)="refresh()"
          >
          </ec-edit-actions>
        </mat-card-actions>
      </mat-card>
    </mat-card>
  `,
  styles: [`
    ::ng-deep .text-display {
      margin-bottom: 20px;
    }
  `]
})
export class SettingsComponent implements OnInit {

  settings: SettingsData = {};
  bankAccounts: BankAccountData[] = [];
  editMode = false;

  constructor(
    private toolbarService: MainToolbarService,
    private messageService: MessageService,
    private settingsService: SettingsService,
    private bankAccountService: BankAccountService
  ) { }

  ngOnInit() {
    this.toolbarService.setHeading('General Settings');
    this.bankAccountService.getBankAccounts().subscribe(bankAccounts => this.bankAccounts = bankAccounts);
    this.refresh();
  }

  refresh() {
    this.settingsService.getSettings().subscribe(newSettings => {
      this.settings = newSettings;
    });
  }

  saveSettings() {
    this.settingsService.saveSettings(this.settings).subscribe(() => {
      this.messageService.setMessage('Settings saved.');
      this.editMode = false;
    },
    (error) => {
      this.messageService.setErrorMessage('Settings not saved.');
    });
  }
}
