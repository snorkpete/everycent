import {Component, OnInit} from '@angular/core';
import {MainToolbarService} from "../../shared/main-toolbar/main-toolbar.service";
import {TransactionSearchParams} from "../transaction-search-form/transaction-search-params.model";
import {LoadingIndicator} from "../../shared/loading-indicator/loading-indicator.service";
import {TransactionData} from "../transaction-data.model";
import {TransactionService} from "../transaction.service";
import {BankAccountData} from "../../bank-accounts/bank-account.model";
import {BudgetData} from "../../budgets/budget.model";

@Component({
  selector: 'ec-transactions',
  styles: [`
    mat-card-content, .container {
      height: 100%;
    }
  `],
  template: `
    <mat-card>
      <mat-card-content>
        <div fxLayout="column" class="container" fxLayoutGap="20px">
          <div class="header" fxLayout="row" fxLayoutGap="20px" fxFlex="1 0 auto">
            <ec-transaction-search-form fxFlex="1 0 auto"
              (change)="refreshTransactions($event)"
            >
            </ec-transaction-search-form>

          </div>
          <div>
            <ec-transaction-summary fxFlex="3 0 auto"></ec-transaction-summary>
          </div>
          <div fxFlex="2 0 auto">
            <ec-transaction-list [transactions]="transactions" [bankAccount]="bankAccount" [budget]="budget"></ec-transaction-list>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `
})
export class TransactionsComponent implements OnInit {

  transactions: TransactionData[] = [];
  bankAccount: BankAccountData = {};
  budget: BudgetData = {};

  constructor(
    private transactionsService: TransactionService,
    private loadingIndicator: LoadingIndicator,
    private toolbarService: MainToolbarService
  ) { }

  ngOnInit() {
    this.toolbarService.setHeading('Transactions');
  }

  refreshTransactions(searchParams: TransactionSearchParams = {}) {

    this.loadingIndicator.show();
    this.transactionsService
        .getTransactions(searchParams)
        .subscribe(transactions => {
          this.transactions = transactions;
          this.bankAccount = searchParams.bankAccount;
          this.budget = searchParams.budget;
          this.loadingIndicator.hide();
        });
  }


}
