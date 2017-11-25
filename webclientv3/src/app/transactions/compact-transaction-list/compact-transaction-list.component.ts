import {Component, Input, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {TransactionData} from '../transaction-data.model';

@Component({
  selector: 'ec-compact-transaction-list',
  template: `
    <h1 mat-dialog-title>Transactions for {{itemName}}</h1>
    <mat-card mat-dialog-content>
        <table class="table">
            <thead>
            <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
            </tr>
            </thead>
            
            <tbody>
            <tr *ngFor="let transaction of transactions">
                <td><ec-date-field [value]="transaction.transaction_date"></ec-date-field></td>
                <td><ec-text-field [value]="transaction.description"></ec-text-field></td>
                <td><ec-money-field [value]="transaction.net_amount"></ec-money-field></td>
            </tr>
            </tbody>
            
        </table>
    </mat-card>
    <div mat-dialog-actions fxLayout="row" fxLayoutAlign="end">
        <button mat-raised-button color="primary" (click)="close()">Close</button>
    </div>
  `,
  styles: []
})
export class CompactTransactionListComponent implements OnInit {

  @Input() transactions: TransactionData[];
  @Input() itemName: string;

  constructor(
    private dialogRef: MatDialogRef<CompactTransactionListComponent>
  ) { }

  ngOnInit() {
  }

  close() {
    this.dialogRef.close();
  }

}
