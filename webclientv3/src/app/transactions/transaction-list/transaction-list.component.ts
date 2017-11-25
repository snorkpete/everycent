import {Component, Input, OnInit} from '@angular/core';
import {TransactionData} from "../transaction-data.model";

@Component({
  selector: 'ec-transaction-list',
  styles: [],
  template: `
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
  `
})
export class TransactionListComponent implements OnInit {

  @Input()
  transactions: TransactionData[] = []

  constructor() { }

  ngOnInit() {
  }

}
