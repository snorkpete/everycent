import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {TransactionData} from "../transaction-data.model";
import {MatTableDataSource} from "@angular/material";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Component({
  selector: 'ec-transaction-list',
  styles: [`
    .table-container {
      position: relative;
      margin-top:50px;
    }
    .table-container .mat-table {
      max-height: calc(100vh - 200px);
      overflow-y: auto;
    }
    .table-container .mat-table .mat-header-row {
      position: absolute;
      top: -50px;
      left: 0px;
      right: 18px;
      background: #fff;
    } 
  `],
  template: `
    <div class="table-container">
    <mat-table #table [dataSource]="dataSource">

      <!-- Select Column -->
      <ng-container matColumnDef="select">
        <mat-header-cell *matHeaderCellDef fxFlex="0 0 10"> </mat-header-cell>
        <mat-cell *matCellDef="let transaction" fxFlex="0 0 10"> {{transaction.id}} </mat-cell>
      </ng-container>

      <!-- Date Column -->
      <ng-container matColumnDef="transactionDate">
        <mat-header-cell *matHeaderCellDef fxFlex="0 0 10">Date</mat-header-cell>
        <mat-cell *matCellDef="let transaction" fxFlex="0 0 10"> {{transaction.transaction_date}} </mat-cell>
      </ng-container>

      <!-- Description Column -->
      <ng-container matColumnDef="description">
        <mat-header-cell *matHeaderCellDef fxFlex="0 0 30">Description</mat-header-cell>
        <mat-cell *matCellDef="let transaction" fxFlex="0 0 30"> {{transaction.description}} </mat-cell>
      </ng-container>

      <!-- Allocation Column -->
      <ng-container matColumnDef="allocation">
        <mat-header-cell *matHeaderCellDef fxFlex="0 0 20">Allocation</mat-header-cell>
        <mat-cell *matCellDef="let transaction" fxFlex="0 0 20"> &nbsp; {{transaction.allocation}} </mat-cell>
      </ng-container>

      <!-- Withdrawn Column -->
      <ng-container matColumnDef="withdrawn">
        <mat-header-cell *matHeaderCellDef fxFlex="0 0 10">Withdrawn</mat-header-cell>
        <mat-cell *matCellDef="let transaction" fxFlex="0 0 10"> {{transaction.withdrawal_amount}} </mat-cell>
      </ng-container>

      <!-- Deposit Column -->
      <ng-container matColumnDef="deposit">
        <mat-header-cell *matHeaderCellDef fxFlex="0 0 10">Deposit</mat-header-cell>
        <mat-cell *matCellDef="let transaction" fxFlex="0 0 10"> {{transaction.deposit_amount}} </mat-cell>
      </ng-container>

      <!-- Paid Column -->
      <ng-container matColumnDef="paid">
        <mat-header-cell *matHeaderCellDef fxFlex="0 0 10">Paid?</mat-header-cell>
        <mat-cell *matCellDef="let transaction" fxFlex="0 0 10"> {{transaction.status == 'paid' ? 'Yes' : 'No' }} </mat-cell>
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
  `
})
export class TransactionListComponent implements OnInit, OnChanges {

  @Input()
  transactions: TransactionData[] = [];
  dataSource = new MatTableDataSource<TransactionData>();
  data = this.dataSource.connect();
  displayedColumns = ['select', 'transactionDate', 'description',
                      'allocation', 'withdrawn', 'deposit','paid', 'action'];

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    const change = changes['transactions'];
    if (change) {
      this.data.next(change.currentValue);
    }
  }

}
