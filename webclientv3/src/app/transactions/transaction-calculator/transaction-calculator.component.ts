import { Component, Input, OnInit } from "@angular/core";
import { total } from "../../util/total";
import { TransactionData } from "../transaction-data.model";

@Component({
  selector: "ec-transaction-calculator",
  template: `
    <div class="container" *ngIf="showCalculator()">
      <mat-card>
        <mat-card-title>Selected Transaction Total</mat-card-title>
        <mat-card-content>
          Total: <strong>{{ transactionTotal() | ecMoney }}</strong>
        </mat-card-content>
        <mat-card-actions fxLayoutAlign="end">
          <button mat-raised-button color="primary" (click)="clearSelections()">
            Clear
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    div.container {
      position: fixed;
      top: 60px;
      right: 60px;
      z-index: 1000;
    }
    mat-card {
      background: #efdbdb;
    }
  `]
})
export class TransactionCalculatorComponent implements OnInit {
  @Input() transactions: TransactionData[] = [];

  constructor() {}

  ngOnInit() {}

  transactionTotal() {
    return total(this.selectedTransactions(), "net_amount");
  }

  selectedTransactions() {
    if (!this.transactions) {
      return [];
    }

    return this.transactions.filter(transaction => transaction.selected);
  }

  showCalculator() {
    return this.selectedTransactions().length > 0;
  }

  clearSelections() {
    this.selectedTransactions().forEach(transaction => {
      transaction.selected = false;
    });
  }
}
