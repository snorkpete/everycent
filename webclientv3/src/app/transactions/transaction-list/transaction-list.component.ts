import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { BankAccountData } from "../../bank-accounts/bank-account.model";
import { BudgetData } from "../../budgets/budget.model";
import { SinkFundAllocationData } from "../../sink-funds/sink-fund-allocation-data.model";
import { AllocationData } from "../allocation-data.model";
import { TransactionData } from "../transaction-data.model";

@Component({
  selector: "ec-transaction-list",
  styles: [
    `
    ec-money-field {
      text-align: end;
    }
    table.table {
      table-layout: fixed;
    }
    .table-container {
      max-height: 400px;
      overflow-y: scroll;
    }
    .mat-form-field-infix {
      width: 5px;
    }
    .menu-heading {
      justify-content: space-between;
    }
  `
  ],
  template: `
    <mat-card>
        <mat-card-title>
          <div fxLayout="row" class="menu-heading">
            <span> Transactions </span>
            <span fxLayout="row" fxLayoutGap="20px">
              <button color="primary" mat-raised-button [routerLink]="linkToBudget()">Go to Budget</button>
              <button color="primary" mat-raised-button routerLink="/account-balances">Go to Account Balances</button>
            </span>
          </div>
        </mat-card-title>
        <mat-card-content>
          <div class="table-container">
            <table class="table">
              <thead ec-transaction-list-header [bankAccount]="bankAccount"></thead>
              <tr ec-transaction-list-row
                  *ngFor="let transaction of transactions; trackBy: trackByFn"
                  [transaction]="transaction"
                  [bankAccount]="bankAccount"
                  [budget]="budget"
                  [allocations]="allocations"
                  [sinkFundAllocations]="sinkFundAllocations"
                  [editMode]="isEditMode"
                  [ecHighlightDeletedFor]="transaction"
              ></tr>
            </table>
          </div>
      </mat-card-content>
      <mat-card-actions>
        <ec-edit-actions [(editMode)]="isEditMode"
                         (save)="save.emit(transactions)"
                         (cancel)="cancel.emit()">
          <button *ngIf="isEditMode" mat-raised-button color="primary" (click)="addTransaction()">
            Add New Transaction
          </button>
          <button *ngIf="isEditMode" mat-raised-button color="accent" (click)="import.emit()">
            Import Transactions
          </button>
        </ec-edit-actions>
      </mat-card-actions>
    </mat-card>
  `
})
export class TransactionListComponent implements OnInit {
  @Input() transactions: TransactionData[] = [];
  @Input() allocations: AllocationData[] = [];
  @Input() sinkFundAllocations: SinkFundAllocationData[] = [];
  @Input() bankAccount: BankAccountData;
  @Input() budget: BudgetData;
  @Input() isEditMode = false;

  @Output() save = new EventEmitter<TransactionData[]>();
  @Output() import = new EventEmitter();
  @Output() cancel = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  addTransaction(): void {
    this.transactions.push({
      withdrawal_amount: 0,
      deposit_amount: 0,
      status: this.bankAccount.is_credit_card ? "unpaid" : "paid"
    });
  }

  trackByFn(index: number, transaction: TransactionData) {
    return transaction.id;
  }

  switchToDisplayMode() {
    this.isEditMode = false;
  }

  linkToBudget() {
    if (this.budget) {
      return `/budgets/${this.budget.id}`;
    }
    return "/budgets";
  }
}
