import {Component, Input, OnInit} from '@angular/core';
import {total} from "../../../util/total";
import {IncomeData} from "../../income.model";

@Component({ /* tslint:disable component-selector */
  selector: '[ec-income-list-footer]',
  template: `
    <tr class="total">
      <th>Total</th>
      <th class="right">{{ incomeTotal() | ecMoney }}</th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
  `,
  styles: []
})
export class IncomeListFooterComponent implements OnInit {

  @Input() incomes: IncomeData[];
  constructor() { }

  ngOnInit() {
  }

  incomeTotal() {
    return total(this.incomes, 'amount');
  }
}
