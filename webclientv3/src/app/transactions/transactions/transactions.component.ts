import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import {MatDialog, MatDialogRef, MatSnackBar} from "@angular/material";
import {ActivatedRoute, Router} from "@angular/router";
import { Subject } from "rxjs/Subject";
import { MessageService } from "../../message-display/message.service";
import { MainToolbarService } from "../../shared/main-toolbar/main-toolbar.service";
import { SinkFundAllocationData } from "../../sink-funds/sink-fund-allocation-data.model";
import { AllocationData } from "../allocation-data.model";
import { TransactionImporterComponent } from "../importers/transaction-importer/transaction-importer.component";
import { TransactionDataService } from "../transaction-data.service";
import { TransactionListComponent } from "../transaction-list/transaction-list.component";
import { TransactionSearchParams } from "../transaction-search-form/transaction-search-params.model";
import { LoadingIndicator } from "../../shared/loading-indicator/loading-indicator.service";
import { TransactionData } from "../transaction-data.model";
import { TransactionService } from "../transaction.service";
import { BankAccountData } from "../../bank-accounts/bank-account.model";
import { BudgetData } from "../../budgets/budget.model";

@Component({
  selector: "ec-transactions",
  styles: [
    `
    mat-card-content, .container {
      height: 100%;
    }
  `
  ],
  template: `
    <mat-card class="main">
      <mat-card-actions fxLayoutGap="10px" align="end">
        <button mat-raised-button (click)="goToBudget()">&laquo; View Budget</button>
        <button mat-raised-button (click)="goToAccountBalances()">&laquo; View Balances</button>
      </mat-card-actions>
      <mat-card-content>
        <div fxLayout="column" class="container" fxLayoutGap="20px">
          <div class="header" fxLayout="row" fxLayoutGap="20px" fxFlex="1 0 auto">
            <ec-transaction-search-form fxFlex="3 0 auto"
                                        (change)="refreshTransactions($event)"
            >
            </ec-transaction-search-form>
            <ec-transaction-summary fxFlex="1 0 auto"
                                    [transactions]="transactions"
                                    [bankAccount]="bankAccount"
                                    [allocations]="allocations"
            >
            </ec-transaction-summary>

          </div>
          <div>
          </div>
          <div fxFlex="2 0 auto">
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
    private messageService: MessageService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.toolbarService.setHeading("Transactions");

    this.transactionDataService.init();
    this.transactionDataService
      .allData$()
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
        this.snackbar.open('Transactions saved', null, {duration: 3000});
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
    // TODO: read this from the bank account
    dialogRef.componentInstance.importType = "abn-amro-bank";

    dialogRef.afterClosed().subscribe((newTransactions: TransactionData[]) => {
      // newTransactions.forEach(transaction => {
      //   this.transactions.push(transaction);
      // });
      this.transactions = this.transactions.concat(newTransactions);
    });

    return dialogRef;
  }

  goToBudget() {
    this.router.navigate(['..', 'budgets', this.budget.id], { relativeTo: this.route.parent });
  }

  goToAccountBalances() {
    this.router.navigateByUrl('/account-balances');
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
    this.transactionDataService.destroy();
  }
}
