import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subject} from "rxjs/Subject";
import {MessageService} from "../../message-display/message.service";
import {MainToolbarService} from "../../shared/main-toolbar/main-toolbar.service";
import {SinkFundAllocationData} from "../../sink-funds/sink-fund-allocation-data.model";
import {AllocationData} from "../allocation-data.model";
import {TransactionDataService} from "../transaction-data.service";
import {TransactionListComponent} from "../transaction-list/transaction-list.component";
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
    <mat-card class="main">
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
              [budget]="budget"
              (save)="save($event)"
              (cancel)="cancel()"
            >
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

  @ViewChild(TransactionListComponent)
  transactionList: TransactionListComponent;

  componentDestroyed = new Subject();

  constructor(
    private transactionService: TransactionService,
    private transactionDataService: TransactionDataService,
    private loadingIndicator: LoadingIndicator,
    private toolbarService: MainToolbarService,
    private messageService: MessageService
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

  save() {
    this.loadingIndicator.show();
    this.transactionService.save(this.transactions, this.bankAccount, this.budget).subscribe(() => {
      this.loadingIndicator.hide();
      this.transactionList.switchToDisplayMode();
      this.messageService.setMessage('Transactions saved.', 5000);
    });
  }

  cancel() {
    this.transactionDataService.refresh({bank_account_id: this.bankAccount.id, budget_id: this.budget.id});
  }


  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
    this.transactionDataService.destroy();
  }
}
