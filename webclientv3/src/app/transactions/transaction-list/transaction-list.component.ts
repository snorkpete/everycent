import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {BudgetData} from "../../budgets/budget.model";
import {TransactionData} from "../transaction-data.model";
import {MatTableDataSource} from "@angular/material";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {BankAccountData} from "../../bank-accounts/bank-account.model";

@Component({
  selector: 'ec-transaction-list',
  styles: [`

    ec-money-field {
      text-align: end;
    }
    .table-container {
      max-height: 400px;
      overflow-y: scroll;
    }
  `],
  template: `
    <mat-card>
        <mat-card-title>Transactions</mat-card-title>
        <mat-card-content>
          <div class="table-container">
            <table class="table">
              <thead ec-transaction-list-header [bankAccount]="bankAccount"></thead>
              <tr ec-transaction-list-row
                  *ngFor="let transaction of transactions; trackBy: trackByFn"
                  [transaction]="transaction"
                  [editMode]="isEditMode"
                  [ecHighlightDeletedFor]="transaction"
              ></tr>
            </table>
          </div>
      </mat-card-content>
      <mat-card-actions>
        <ec-edit-actions [(editMode)]="isEditMode" (save)="save()" (cancel)="cancel()"></ec-edit-actions>
      </mat-card-actions>
    </mat-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionListComponent implements OnInit, OnChanges {

  @Input()
  transactions: TransactionData[] = [];
  @Input()
  bankAccount: BankAccountData;
  @Input()
  budget: BudgetData;
  @Input()
  isEditMode = false;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  save(): void {

  }

  cancel(): void {

  }

  trackByFn(index: number, transaction: TransactionData) {
    return transaction.id;
  }
}
