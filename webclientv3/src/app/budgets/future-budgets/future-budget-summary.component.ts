import {Component, Input, OnInit} from '@angular/core';
import {SettingsService} from "../../shared/settings.service";
import {total} from "../../util/total";
import {BudgetData} from "../budget.model";

@Component({ /* tslint:disable component-selector */
  selector: '[ec-future-budget-summary]',
  template: `
    <tr class="total">
      <th>Total Discretionary Money</th>
      <th *ngFor="let budget of budgets; let index=index" class="right">
        {{ totalDiscretionaryAmount(index) | ecMoney }}
      </th>
    </tr>
    <tr>
      <td>{{husband}}'s Amount</td>
      <td *ngFor="let budget of budgets; let index=index" class="right">
        {{ husbandAmount(index) | ecMoney }}
      </td>
    </tr>
    <tr>
      <td>{{wife}}'s Amount</td>
      <td *ngFor="let budget of budgets; let index=index" class="right">
        {{ wifeAmount(index) | ecMoney }}
      </td>
    </tr>
  `,
  styles: []
})
export class FutureBudgetSummaryComponent implements OnInit {

  @Input() budgets: BudgetData[] = [];
  wife = 'wife';
  husband = 'husband';

  constructor(
    private settingsService: SettingsService
  ) { }

  ngOnInit() {
    this.settingsService.getSettings().subscribe(settings => {
      this.wife = settings.wife;
      this.husband = settings.husband;
    });
  }

  totalDiscretionaryAmount(index: number) {
    let budget = this.budgets[index];
    return total(budget.incomes, 'amount') - total(budget.allocations, 'amount');
  }

  husbandAmount(index: number) {
    return this.totalDiscretionaryAmount(index) / 2;
  }

  wifeAmount(index: number) {
    return this.totalDiscretionaryAmount(index) / 2;
  }
}
