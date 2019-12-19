import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { BankAccountData } from "../../bank-accounts/bank-account.model";
import { BudgetData } from "../../budgets/budget.model";
import { MessageService } from "../../message-display/message.service";
import { LoadingIndicator } from "../../shared/loading-indicator/loading-indicator.service";
import { MainToolbarService } from "../../shared/main-toolbar/main-toolbar.service";
import { SinkFundAllocationData } from "../../sink-funds/sink-fund-allocation-data.model";
import { AllocationData } from "../allocation-data.model";
import { TransactionImporterComponent } from "../importers/transaction-importer/transaction-importer.component";
import { TransactionData } from "../transaction-data.model";
import { TransactionDataService } from "../transaction-data.service";
import { TransactionListComponent } from "../transaction-list/transaction-list.component";
import { TransactionSearchParams } from "../transaction-search-form/transaction-search-params.model";
import { TransactionService } from "../transaction.service";

@Component({
  selector: "ec-transactions",
  styles: [
    `
      mat-card-content, .container {
        height: 100%;
        overflow: auto;
      }

      .container {
        display: grid;
        width: 100%;
        grid-template-areas:
          "selector summary"
          "list     list";
        grid-template-rows: 175px 1fr;
        grid-template-columns: 1fr 1fr;
        column-gap: 20px;
      }

      @media (max-width: 600px){
        mat-card.main {
          height: 100%;
        }
        .container {
          display: grid;
          width: 100%;
          grid-template-areas:
            "selector"
            "summary"
            "list";
          grid-template-rows: 175px 160px 1fr;
          grid-template-columns: auto;
        }
      }

      ec-transaction-search-form {
        grid-area: selector;
        width: 100%;
      }
      ec-transaction-summary {
        grid-area: summary;
        width: 100%;
      }
      ec-transaction-list {
        grid-area: list;
        overflow: auto;
        width: 100%;
      }

  `
  ],
  template: `
    <mat-card class="main">
      <mat-card-content>
        <ec-transaction-calculator [transactions]="transactions">
        </ec-transaction-calculator>
        <div class="container">
          <ec-transaction-search-form (change)="refreshTransactions($event)"
          >
          </ec-transaction-search-form>
          <ec-transaction-summary [transactions]="transactions"
                                  [bankAccount]="bankAccount"
                                  [allocations]="allocations"
          >
          </ec-transaction-summary>
          <ec-transaction-list
            [transactions]="transactions"
            [allocations]="allocations"
            [sinkFundAllocations]="sinkFundAllocations"
            [bankAccount]="bankAccount"
            [budget]="budget"
            (save)="save()"
            (cancel)="cancel()"
            (import)="showImportForm()"
          >
          </ec-transaction-list>
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

  @ViewChild(TransactionListComponent, { static: true })
  transactionList: TransactionListComponent;

  componentDestroyed = new Subject();

  constructor(
    private transactionService: TransactionService,
    private transactionDataService: TransactionDataService,
    private loadingIndicator: LoadingIndicator,
    private toolbarService: MainToolbarService,
    private messageService: MessageService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.toolbarService.setHeading("Transactions");

    this.transactionDataService.init();
    this.transactionDataService
      .allData$()
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe(([transactions, allocations, sinkFundAllocations]) => {
        this.transactions = transactions;
        this.allocations = allocations;
        this.sinkFundAllocations = sinkFundAllocations;
        this.loadingIndicator.hide();
      });
  }

  refreshTransactions(searchParams: TransactionSearchParams = {}) {
    this.loadingIndicator.show();
    if (searchParams.bankAccount) {
      this.bankAccount = searchParams.bankAccount;
    }
    if (searchParams.budget) {
      this.budget = searchParams.budget;
    }
    this.transactionDataService.refresh(searchParams);
  }

  refresh() {
    this.refreshTransactions({
      budget_id: this.budget.id,
      bank_account_id: this.bankAccount.id
    });
  }

  save() {
    this.loadingIndicator.show();
    this.transactionService
      .save(this.transactions, this.bankAccount, this.budget)
      .subscribe(() => {
        this.loadingIndicator.hide();
        this.transactionList.switchToDisplayMode();
        this.refresh();
        this.messageService.setMessage("Transactions saved.", 5000);
      });
  }

  cancel() {
    this.transactionDataService.refresh({
      bank_account_id: this.bankAccount.id,
      budget_id: this.budget.id
    });
  }

  // TODO: move this to a service
  showImportForm(): MatDialogRef<TransactionImporterComponent> {
    let dialogRef = this.dialog.open(TransactionImporterComponent, {
      width: "350px"
    });
    dialogRef.componentInstance.startDate = this.budget.start_date;
    dialogRef.componentInstance.endDate = this.budget.end_date;
    dialogRef.componentInstance.importType = this.bankAccount.import_format;

    dialogRef.afterClosed().subscribe((newTransactions: TransactionData[]) => {
      if (newTransactions.length > 0) {
        this.transactions = this.transactions.concat(newTransactions);
      }
    });

    return dialogRef;
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
    this.transactionDataService.destroy();
  }
}
