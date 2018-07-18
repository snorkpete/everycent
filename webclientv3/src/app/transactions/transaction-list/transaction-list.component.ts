import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from "@angular/core";
import { MatTable } from "@angular/material";
import { BankAccountData } from "../../bank-accounts/bank-account.model";
import { BudgetData } from "../../budgets/budget.model";
import { SinkFundAllocationData } from "../../sink-funds/sink-fund-allocation-data.model";
import { AllocationData } from "../allocation-data.model";
import { TransactionData } from "../transaction-data.model";

@Component({
  selector: "ec-transaction-list",
  styles: [
    `
      table {
        width: 100%;
        table-layout: fixed;
      }

      ec-money-field {
      text-align: end;
    }

      td[mat-cell] {
        padding-left: 5px;
        padding-right: 5px;
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
            <table mat-table [dataSource]="transactions" [trackBy]="trackByFn" class="mat-elevation-z8">

              <!-- selection Column -->
              <ng-container matColumnDef="selection">
                <th mat-header-cell *matHeaderCellDef style="width:5%;"></th>
                <td mat-cell *matCellDef="let transaction">
                  {{transaction.item}}
                  <mat-checkbox color="primary" [(ngModel)]="transaction.selected"></mat-checkbox>
                </td>
                <td mat-footer-cell *matFooterCellDef>  </td>
              </ng-container>

              <!-- Date Column -->
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef> Date </th>
                <td mat-cell *matCellDef="let transaction" style="width:15%;">
                  <ec-date-field
                    [editMode]="isEditMode"
                    [(ngModel)]="transaction.transaction_date"
                    [ecValidateWithinBudget]="budget"
                    [errorMessage]="'test'"
                  >
                  </ec-date-field>
                </td>
                <td mat-footer-cell *matFooterCellDef>  </td>
              </ng-container>

              <!-- Description Column -->
              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef style="width:30%;">Description</th>
                <td mat-cell *matCellDef="let transaction">
                  <ec-text-field [editMode]="isEditMode" [(ngModel)]="transaction.description"></ec-text-field>
                </td>
                <td mat-footer-cell *matFooterCellDef> Total </td>
              </ng-container>

              <!-- Allocation Column -->
              <ng-container matColumnDef="allocation">
                <th mat-header-cell *matHeaderCellDef style="width:20%;">
                  {{ allocationHeaderName() }}
                </th>
                <td mat-cell *matCellDef="let transaction">

                  <ng-container *ngIf="bankAccount?.is_sink_fund; then sinkFundAllocationField else allocationField">
                  </ng-container>

                  <ng-template #sinkFundAllocationField>
                    <ec-list-field [editMode]="isEditMode"
                                   [items]="sinkFundAllocations"
                                   [(ngModel)]="transaction.sink_fund_allocation_id">
                    </ec-list-field>
                  </ng-template>

                  <ng-template #allocationField>
                    <ec-list-field [editMode]="isEditMode"
                                   [items]="allocations"
                                   (change)="updatePaidStatus(transaction)"
                                   groupBy="allocation_category"
                                   [(ngModel)]="transaction.allocation_id">
                    </ec-list-field>
                  </ng-template>

                </td>

                <td mat-footer-cell *matFooterCellDef> Allocation </td>
              </ng-container>

              <!-- Withdrawn Column -->
              <ng-container matColumnDef="withdrawn">
                <th mat-header-cell *matHeaderCellDef style="width:10%;" class="right">Withdrawn</th>
                <td mat-cell *matCellDef="let transaction" class="right">
                  <ec-money-field [editMode]="isEditMode" [(ngModel)]="transaction.withdrawal_amount"></ec-money-field>
                </td>
                <td mat-footer-cell *matFooterCellDef></td>
              </ng-container>

              <!-- Deposit Column -->
              <ng-container matColumnDef="deposit">
                <th mat-header-cell *matHeaderCellDef style="width:10%;" class="right">Deposited</th>
                <td mat-cell *matCellDef="let transaction" class="right">
                  <ec-money-field [editMode]="isEditMode" [(ngModel)]="transaction.deposit_amount"></ec-money-field>
                </td>
                <td mat-footer-cell *matFooterCellDef></td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="paid">
                <th mat-header-cell *matHeaderCellDef style="width:5%;">Paid?</th>
                <td mat-cell *matCellDef="let transaction" class="center">
                  <ec-paid-field [editMode]="isEditMode" [(ngModel)]="transaction.status"></ec-paid-field>
                </td>
                <td mat-footer-cell *matFooterCellDef></td>
              </ng-container>

              <!-- Action Column -->
              <ng-container matColumnDef="action">
                <th mat-header-cell *matHeaderCellDef style="width:5%;">Action</th>
                <td mat-cell *matCellDef="let transaction" class="center">
                  <ec-delete-button [editMode]="isEditMode" [item]="transaction"></ec-delete-button>
                </td>
                <td mat-footer-cell *matFooterCellDef> </td>
              </ng-container>
              <!--
              <thead>
                <tr class="heading">

                  <th style="width:10%;" class="right"></th>
                  <th style="width: 5%;" class="center">Paid?</th>
                  <th style="width: 5%;"></th>
                </tr>
              </thead>
              <tr *ngFor="let transaction of transactions; trackBy: trackByFn"
                  [ecHighlightDeletedFor]="transaction" >
                <td>
                </td>
                <td>


              </tr>
              -->

              <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true">
              </tr>

              <tr mat-row *matRowDef="let transaction; columns: displayedColumns;"
                  [ecHighlightDeletedFor]="transaction"></tr>

              <!--<tr mat-footer-row *matFooterRowDef="displayedColumns; sticky: true"></tr>-->
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

  displayedColumns: string[] = [
    "selection",
    "date",
    "description",
    "allocation",
    "withdrawn",
    "deposit",
    "paid",
    "action"
  ];

  @ViewChild(MatTable) transactionList: MatTable<TransactionData>;

  constructor() {}

  ngOnInit() {}

  addTransaction(): void {
    this.transactions.push({
      withdrawal_amount: 0,
      deposit_amount: 0,
      status: this.bankAccount.is_credit_card ? "unpaid" : "paid"
    });
    this.transactionList.renderRows();
  }

  allocationHeaderName() {
    if (this.bankAccount && this.bankAccount.is_sink_fund) {
      return "Sink Fund Allocation";
    } else {
      return "Allocation";
    }
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

  updatePaidStatus(transaction: TransactionData) {
    if (transaction.allocation_id > 0) {
      transaction.status = "paid";
    } else {
      transaction.status = "unpaid";
    }
  }
}
