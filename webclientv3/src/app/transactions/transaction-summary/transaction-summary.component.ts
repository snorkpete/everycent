import { Component, Input, OnInit } from "@angular/core";
import { BankAccountData } from "../../bank-accounts/bank-account.model";
import {total} from "../../util/total";
import { AllocationData } from "../allocation-data.model";
import { TransactionData } from "../transaction-data.model";

@Component({
  selector: "ec-transaction-summary",
  styles: [`
    .heading {
      flex: 1;
      font-weight: bold;
    }
    .value {
      flex: 1;
      text-align: right;
    }
    .total {
      font-size: 16px;
      border-top: 1px solid black;
    }
  `],
  template: `
    <mat-card>
      <mat-card-content>
        <div fxLayout="row">
          <span class="heading">Last Bank Balance</span>
          <span class="value">{{ lastBankBalance() | ecMoney }}</span>
        </div>

        <div fxLayout="row">
          <span class="heading">Transaction Total</span>
          <span class="value">{{ transactionTotal() | ecMoney }}</span>
        </div>

        <div fxLayout="row" class="total">
          <span class="heading">Current Bank Balance</span>
          <span class="value">
            <ec-money-field [value]="currentBankBalance()" [highlightPositive]="true"></ec-money-field>
          </span>
        </div>

        <ng-container *ngIf="showBudgetBalance()">
          <div fxLayout="row">
            <span class="heading">Current Budget Balance</span>
            <span class="value">{{ lastBudgetBalance() | ecMoney }}</span>
          </div>

          <div fxLayout="row" class="total">
            <span class="heading">Difference (Bank vs Budget)</span>
            <span class="value">
                <ec-money-field [value]="budgetDifference()" [highlightPositive]="true"></ec-money-field>
            </span>
          </div>
        </ng-container>

        <ng-container *ngIf="showUnpaidBalance()">
          <div fxLayout="row">
            <span class="heading">Unpaid Balance</span>
            <span class="value">
              <ec-money-field [value]="unpaidBalance()" [highlightPositive]="true"></ec-money-field>
            </span>
          </div>
          <div fxLayout="row">
            <span class="heading">Unpaid Difference</span>
            <span class="value">
              <ec-money-field [value]="unpaidDifference()" [highlightPositive]="true"></ec-money-field>
            </span>
          </div>
        </ng-container>
      </mat-card-content>
    </mat-card>
  `
})
export class TransactionSummaryComponent implements OnInit {
  primary_budget_account_id: number;

  @Input() bankAccount: BankAccountData;
  @Input() transactions: TransactionData[];
  @Input() allocations: AllocationData[];

  constructor() {}

  ngOnInit() {
    // TODO;
    // SettingsService.getSettings().then(function(settings){
    //   vm.primary_budget_account_id = settings.primary_budget_account_id;
    // });
    this.primary_budget_account_id = 3;
  }

  lastBankBalance() {
    if (!this.bankAccount) {
      return 0;
    }
    return this.bankAccount.closing_balance;
  }

  transactionTotal() {
    if (!this.transactions) {
      return 0;
    }

    let totalWithdrawals = 0;
    let totalDeposits = 0;

    this.transactions.forEach(transaction => {
      if (!transaction.deleted) {
        totalWithdrawals += transaction.withdrawal_amount;
        totalDeposits += transaction.deposit_amount;
      }
    });

    return totalDeposits - totalWithdrawals;
  }

  currentBankBalance() {
    return this.lastBankBalance() + this.transactionTotal();
  }

  showBudgetBalance() {
    if (!this.bankAccount) {
      return false;
    }
    return this.bankAccount.id === this.primary_budget_account_id;
  }

  lastBudgetBalance() {
    return (
      total(this.allocations, "amount") -
      total(this.allocations, "spent")
    );
  }

  currentBudgetBalance() {
    return this.lastBudgetBalance();
  }

  budgetDifference() {
    return this.currentBankBalance() - this.currentBudgetBalance();
  }

  showUnpaidBalance() {
    if (!this.bankAccount) {
      return false;
    }

    return this.bankAccount.account_type === "credit_card";
  }

  unpaidBalance() {
    if (!this.transactions) {
      return 0;
    }

    let unpaidTransactions = this.transactions.filter(transaction => {
      return !transaction.paid;
    });

    return total(unpaidTransactions, "net_amount");
  }

  unpaidDifference() {
    return this.currentBankBalance() - this.unpaidBalance();
  }
}
