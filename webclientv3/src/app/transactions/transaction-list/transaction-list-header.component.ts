import {Component, Input, OnInit} from '@angular/core';
import {BankAccountData} from "../../bank-accounts/bank-account.model";

@Component({/* tslint:disable component-selector */
  selector: '[ec-transaction-list-header]',
  template: `
    <tr class="heading">
      <th style="width:5%;"></th>
      <th style="width:15%;">Date</th>
      <th style="width:30%;">Description</th>

      <th style="width:20%;" class="allocation-header">
        <span *ngIf="bankAccount?.is_sink_fund; else allocationHeader">Sink Fund Allocation</span>
        <ng-template #allocationHeader>
          <span>Allocation</span>
        </ng-template>
      </th>
      <th style="width:10%;" class="right">Withdrawn</th>
      <th style="width:10%;" class="right">Deposited</th>
      <th style="width: 5%;" class="center">Paid?</th>
      <th style="width: 5%;"></th>
    </tr>
  `,
  styles: [`
  `]
})
export class TransactionListHeaderComponent implements OnInit {

  @Input() bankAccount: BankAccountData;
  constructor() { }

  ngOnInit() {
  }

}
