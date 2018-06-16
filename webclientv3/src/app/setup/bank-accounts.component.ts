import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material";
import { switchMap } from "rxjs/operators";
import { BankAccountData } from "../bank-accounts/bank-account.model";
import { InstitutionData } from "../bank-accounts/institution.model";
import { MessageService } from "../message-display/message.service";
import { MainToolbarService } from "../shared/main-toolbar/main-toolbar.service";
import { BankAccountEditFormComponent } from "./bank-account-edit-form.component";
import { SetupService } from "./setup.service";

@Component({
  selector: "ec-bank-accounts",
  template: `
    <mat-card class="main">
      <mat-card>
        <mat-card-title>Bank Accounts</mat-card-title>
        <mat-card-content>
          <mat-list>
            <ng-container *ngFor="let bankAccount of bankAccounts">
              <mat-list-item>
                <div class="list-item-with-action-buttons">
                  <span> {{ bankAccount.name }} </span>
                  <button mat-raised-button color="primary" (click)="viewDetails(bankAccount)">View</button>
                </div>
              </mat-list-item>
              <mat-divider></mat-divider>
            </ng-container>
          </mat-list>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="addBankAccount()">Add Bank Account</button>
          <button mat-raised-button (click)="refresh()">Refresh</button>
        </mat-card-actions>
      </mat-card>
    </mat-card>
  `,
  styles: []
})
export class BankAccountsComponent implements OnInit {
  bankAccounts: BankAccountData[] = [];
  institutions: InstitutionData[] = [];

  constructor(
    private setupService: SetupService,
    private dialog: MatDialog,
    private toolbar: MainToolbarService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.toolbar.setHeading("Setup Bank Accounts");
    this.refresh();
  }

  refresh() {
    this.setupService
      .getBankAccounts()
      .subscribe(bankAccounts => (this.bankAccounts = bankAccounts));

    this.setupService
      .getInstitutions()
      .subscribe(institutions => (this.institutions = institutions));
  }

  viewDetails(bankAccount: BankAccountData) {
    let dialogRef = this.dialog.open(BankAccountEditFormComponent, {});

    const form = dialogRef.componentInstance;
    form.bankAccount = bankAccount;
    form.institutions = this.institutions;
    form.save
      .pipe(
        switchMap(updatedBankAccount =>
          this.setupService.createOrUpdateBankAccount(updatedBankAccount)
        )
      )
      .subscribe(
        () => {
          this.messageService.setMessage("Bank Account saved.");
          this.refresh();
          dialogRef.close();
        },
        error => {
          this.messageService.setErrorMessage("Bank Account not saved.");
          this.refresh();
        }
      );
  }

  addBankAccount() {
    this.viewDetails({ id: 0, name: "" });
  }
}
