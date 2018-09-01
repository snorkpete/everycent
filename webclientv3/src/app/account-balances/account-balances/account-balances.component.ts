import { Component, OnInit } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material";
import { switchMap } from "rxjs/operators";
import { BudgetMassEditFormComponent } from "../../budgets/future-budgets/mass-edit/budget-mass-edit-form.component";
import { MessageService } from "../../message-display/message.service";
import { MainToolbarService } from "../../shared/main-toolbar/main-toolbar.service";
import { AccountBalancesService } from "../account-balances.service";
import { AdjustBalancesComponent } from "../adjust-balances/adjust-balances.component";
import { BankAccountData } from "../bank-account.model";
import { MatSlideToggleChange } from "@angular/material/slide-toggle";

@Component({
  selector: "ec-account-balances",
  styles: [
    `
    .total {
      margin-right: 25px;
    }

    ec-account-list {
      margin-bottom: 5px;
    }

      .button-row {
        margin-top: 15px;
        margin-bottom: 15px;
      }
  `
  ],
  template: `
    <mat-card class="main">
      <mat-card-content>
        <div fxLayout="column">
          <div class="button-row" fxLayoutAlign="space-between" >
            <mat-slide-toggle fxFlexAlign="center end" [checked]="false"
                              (change)="onIncludeClosedChanged($event)">
              Include Closed Accounts?
            </mat-slide-toggle>
            <button mat-raised-button
                    color="primary"
                    class="adjust-balances"
                    (click)="showAdjustAccountBalancesForm()">
              Adjust Account Balances
            </button>
          </div>
          <ec-account-list [bankAccounts]="currentAccounts" heading="Current Accounts"></ec-account-list>
          <ec-account-list [bankAccounts]="cashAssetAccounts" heading="Cash Assets"></ec-account-list>
          <ec-account-list [bankAccounts]="nonCashAssetAccounts" heading="Non Cash Assets"></ec-account-list>
          <div class="total" fxLayoutAlign="end">
            <h3>Total Assets: {{ totalAssets | ecMoney }}</h3>
          </div>
          <ec-account-list [bankAccounts]="creditCardAccounts" heading="Credit Cards"></ec-account-list>
          <ec-account-list [bankAccounts]="loanAccounts" heading="Loans"></ec-account-list>

          <ec-account-balance-totals [bankAccounts]="bankAccounts"></ec-account-balance-totals>
        </div>
      </mat-card-content>
    </mat-card>
  `
})
export class AccountBalancesComponent implements OnInit {
  bankAccounts: BankAccountData[] = [];

  assetAccounts: BankAccountData[];
  currentAccounts: BankAccountData[];
  nonCashAssetAccounts: BankAccountData[];

  loanAccounts: BankAccountData[];
  creditCardAccounts: BankAccountData[];
  liabilityAccounts: BankAccountData[];
  cashAssetAccounts: BankAccountData[];

  totalAssets = 0;
  searchParams = {};

  includeClosedAccounts = false;

  dialogRef: MatDialogRef<AdjustBalancesComponent>;

  constructor(
    private toolbarService: MainToolbarService,
    public accountBalancesService: AccountBalancesService,
    public dialog: MatDialog,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.toolbarService.setHeading("Account Balances");
    this.refreshBankAccountList();
  }

  onIncludeClosedChanged(toggleEvent: MatSlideToggleChange) {
    this.includeClosedAccounts = toggleEvent.checked;
    this.refreshBankAccountList();
  }

  refreshBankAccountList() {
    this.accountBalancesService
      .getAccountBalances$(this.includeClosedAccounts)
      .subscribe(bankAccounts => {
        this.bankAccounts = bankAccounts;
        this.updateBankAccountLists();
        this.totalAssets = this.accountBalancesService.totalAssets(
          this.bankAccounts
        );
      });
  }

  updateBankAccountLists() {
    this.currentAccounts = this.bankAccounts.filter(
      b => b.account_category === "current"
    );
    this.assetAccounts = this.bankAccounts.filter(
      b => b.account_category === "asset"
    );
    this.cashAssetAccounts = this.bankAccounts.filter(bankAccount => {
      return bankAccount.account_category === "asset" && bankAccount.is_cash;
    });
    this.nonCashAssetAccounts = this.bankAccounts.filter(bankAccount => {
      return bankAccount.account_category === "asset" && !bankAccount.is_cash;
    });
    this.liabilityAccounts = this.bankAccounts.filter(bankAccount => {
      return bankAccount.account_category === "liability";
    });
    this.creditCardAccounts = this.bankAccounts.filter(bankAccount => {
      return (
        bankAccount.account_category === "liability" && bankAccount.is_cash
      );
    });
    this.loanAccounts = this.bankAccounts.filter(bankAccount => {
      return (
        bankAccount.account_category === "liability" && !bankAccount.is_cash
      );
    });
  }

  showAdjustAccountBalancesForm() {
    this.dialogRef = this.dialog.open(AdjustBalancesComponent, {
      maxHeight: 600
    });

    const form = this.dialogRef.componentInstance;
    form.bankAccounts = this.bankAccounts;

    form.save
      .pipe(
        switchMap(budgetAdjustments =>
          this.accountBalancesService.adjustAccountBalances(budgetAdjustments)
        )
      )
      .subscribe(result => {
        this.messageService.setMessage("Balances adjusted.");
        this.refreshBankAccountList();
        this.dialogRef.close();
      });
  }
}
