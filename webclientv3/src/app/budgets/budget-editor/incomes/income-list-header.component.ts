import {Component, Input, OnInit} from '@angular/core';

@Component({/* tslint:disable component-selector */
  selector: '[ec-income-list-header]',
  template: `
    <tr>
      <th style="width:25%;">Name</th>
      <th style="width:15%;" class="text-right">Amount</th>
      <th style="width:15%;">Bank Account</th>
      <th style="width:40%;">Comment</th>
      <th style="width:5%;"></th>
    </tr>
  `,
  styles: []
})
export class IncomeListHeaderComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
