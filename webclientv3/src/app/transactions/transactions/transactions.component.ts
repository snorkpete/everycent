import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from "rxjs/Subject";
import {MainToolbarService} from "../../shared/main-toolbar/main-toolbar.service";
import {SinkFundAllocationData} from "../../sink-funds/sink-fund-allocation-data.model";
import {AllocationData} from "../allocation-data.model";
import {TransactionDataService} from "../transaction-data.service";
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
            <ec-transaction-list
              [transactions]="transactions"
              [allocations]="allocations"
              [sinkFundAllocations]="sinkFundAllocations"
              [bankAccount]="bankAccount"
              [budget]="budget">
            </ec-transaction-list>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `
})
export class TransactionsComponent implements OnInit, OnDestroy {
  transactions: TransactionData[] = [];
  allocations: AllocationData[] = [];
  sinkFundAllocations: SinkFundAllocationData[] = [];
  bankAccount: BankAccountData = {};
  budget: BudgetData = {};

  componentDestroyed = new Subject();

  constructor(
    private transactionDataService: TransactionDataService,
    private loadingIndicator: LoadingIndicator,
    private toolbarService: MainToolbarService
  ) { }

  ngOnInit() {
    this.toolbarService.setHeading('Transactions');

    this.transactionDataService.init();
    this.transactionDataService.allData$()
        .takeUntil(this.componentDestroyed)
        .subscribe(([transactions, allocations, sinkFundAllocations]) => {
          this.transactions = transactions;
          this.allocations = allocations;
          this.sinkFundAllocations = sinkFundAllocations;
          this.loadingIndicator.hide();
        });
  }

  refreshTransactions(searchParams: TransactionSearchParams = {}) {
    this.loadingIndicator.show();
    this.bankAccount = searchParams.bankAccount;
    this.budget = searchParams.budget;
    this.transactionDataService.refresh(searchParams);
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
    this.transactionDataService.destroy();
  }
}
