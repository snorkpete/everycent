import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {TransactionData} from "../transaction-data.model";
import {MatTableDataSource} from "@angular/material";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Component({
  selector: 'ec-transaction-list',
  styles: [`

    ec-money-field {
      text-align: end;
    }
    .table-container {
      max-height: 400px;
    }
    .table-container {
      position: relative;
      margin-top:50px;
    }
    .table-container mat-table {
      max-height: calc(100vh - 200px);
      overflow-y: auto;
    }
    .table-container .mat-table mat-header-row {
      position: absolute;
      top: -50px;
      left: 0px;
      right: 18px;
      background: #fff;
    }
  `],
  template: `
    <mat-card>
        <mat-card-title>Transactions</mat-card-title>
        <mat-card-content>
          <div class="table-container">
          <mat-table #table [dataSource]="dataSource">

            <!-- Select Column -->
            <ng-container matColumnDef="select">
              <mat-header-cell *matHeaderCellDef fxFlex="0 0 3"> <mat-checkbox></mat-checkbox> </mat-header-cell>
              <mat-cell *matCellDef="let transaction" fxFlex="0 0 3">
                <mat-checkbox></mat-checkbox>
              </mat-cell>
            </ng-container>

            <!-- Date Column -->
            <ng-container matColumnDef="transactionDate">
              <mat-header-cell *matHeaderCellDef fxFlex="0 0 10">Date</mat-header-cell>
              <mat-cell *matCellDef="let transaction" fxFlex="0 0 10">
                <ec-date-field [editMode]="isEditMode" [(ngModel)]="transaction.transaction_date"></ec-date-field>
              </mat-cell>
            </ng-container>

            <!-- Description Column -->
            <ng-container matColumnDef="description">
              <mat-header-cell *matHeaderCellDef fxFlex="0 0 30">Description</mat-header-cell>
              <mat-cell *matCellDef="let transaction" fxFlex="0 0 30">
                <ec-text-field [editMode]="isEditMode" [(ngModel)]="transaction.description"></ec-text-field>
              </mat-cell>
            </ng-container>

            <!-- Allocation Column -->
            <ng-container matColumnDef="allocation">
              <mat-header-cell *matHeaderCellDef fxFlex="0 0 20">Allocation</mat-header-cell>
              <mat-cell *matCellDef="let transaction" fxFlex="0 0 20">
                <ec-text-field [editMode]="isEditMode" [value]="transaction.allocation?.name"></ec-text-field>
              </mat-cell>
            </ng-container>

            <!-- Withdrawn Column -->
            <ng-container matColumnDef="withdrawn">
              <mat-header-cell *matHeaderCellDef fxFlex="0 0 10">Withdrawn</mat-header-cell>
              <mat-cell *matCellDef="let transaction" fxFlex="0 0 10">
                <ec-money-field [editMode]="isEditMode" [(ngModel)]="transaction.withdrawal_amount"></ec-money-field>
              </mat-cell>
            </ng-container>

            <!-- Deposit Column -->
            <ng-container matColumnDef="deposit">
              <mat-header-cell *matHeaderCellDef fxFlex="0 0 10">Deposit</mat-header-cell>
              <mat-cell *matCellDef="let transaction" fxFlex="0 0 10">
                <ec-money-field [editMode]="isEditMode" [(ngModel)]="transaction.deposit_amount"></ec-money-field>
              </mat-cell>
            </ng-container>

            <!-- Paid Column -->
            <ng-container matColumnDef="paid">
              <mat-header-cell *matHeaderCellDef fxFlex="0 0 10">Paid?</mat-header-cell>
              <mat-cell *matCellDef="let transaction" fxFlex="0 0 10">
                {{transaction.status == 'paid' ? 'Yes' : 'No' }}
              </mat-cell>
            </ng-container>

            <!-- Action Column -->
            <ng-container matColumnDef="action">
              <mat-header-cell *matHeaderCellDef fxFlex="0 0 10"></mat-header-cell>
              <mat-cell *matCellDef="let transaction" fxFlex="0 0 10">
                <ec-delete-button [item]="transaction"></ec-delete-button>
              </mat-cell>
            </ng-container>

            <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
            <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
          </mat-table>
          </div>
      </mat-card-content>
      <mat-card-actions>
        <ec-edit-actions [editMode]="isEditMode" (save)="save()" (cancel)="cancel()"></ec-edit-actions>
      </mat-card-actions>
    </mat-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionListComponent implements OnInit, OnChanges {

  @Input()
  transactions: TransactionData[] = [];
  dataSource = new MatTableDataSource<TransactionData>();
  data = this.dataSource.connect();
  displayedColumns = ['select', 'transactionDate', 'description',
                      'allocation', 'withdrawn', 'deposit', 'paid', 'action'];

  @Input()
  isEditMode = false;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    const change = changes['transactions'];
    if (change) {
      this.data.next(change.currentValue);
    }
  }

  save(): void {

  }

  cancel(): void {

  }
}
