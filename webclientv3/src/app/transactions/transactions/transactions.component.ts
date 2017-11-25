import {Component, OnInit} from '@angular/core';
import {TransactionSearchParams} from "../transaction-search-form/transaction-search-params.model";
import {LoadingIndicator} from "../../shared/loading-indicator/loading-indicator.service";
import {TransactionData} from "../transaction-data.model";
import {TransactionService} from "../transaction.service";

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
            <ec-transaction-search-form fxFlex
              (change)="refreshTransactions($event)"
            >
            </ec-transaction-search-form>
            
            <ec-transaction-summary fxFlex></ec-transaction-summary>
          </div>
          <div fxFlex="2 0 auto">
            <ec-transaction-list [transactions]="transactions"></ec-transaction-list>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `
})
export class TransactionsComponent implements OnInit {

  transactions: TransactionData[] = [];

  constructor(
    private transactionsService: TransactionService,
    private loadingIndicator: LoadingIndicator
  ) { }

  ngOnInit() {
  }

  refreshTransactions(searchParams: TransactionSearchParams = {}) {

    this.loadingIndicator.show();
    this.transactionsService
        .getTransactions(searchParams)
        .subscribe(transactions => {
          this.transactions = transactions;
          this.loadingIndicator.hide();
        });
  }


}
