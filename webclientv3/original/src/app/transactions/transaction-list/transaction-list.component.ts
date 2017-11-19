import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TransactionData} from '../transaction-data.model';
import {MdDialogRef} from '@angular/material';

@Component({
  selector: 'ec-transaction-list',
  template: `
    <h1 md-dialog-title>Transactions for {{itemName}}</h1>
    <md-card md-dialog-content>
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
    </md-card>
    <div md-dialog-actions fxLayout="row" fxLayoutAlign="end">
        <button md-raised-button color="primary" (click)="close()">Close</button>
    </div>
  `,
  styles: []
})
export class TransactionListComponent implements OnInit {

  @Input() transactions: TransactionData[];
  @Input() itemName: string;

  constructor(
    private dialogRef: MdDialogRef<TransactionListComponent>
  ) { }

  ngOnInit() {
  }

  close() {
    this.dialogRef.close();
  }

}
