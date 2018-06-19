import {total} from "../../../util/total";
import { Component, Input, OnInit } from "@angular/core";
import { BudgetData } from "../../budget.model";
import { FutureBudgetsDataFormatterService } from "../future-budgets-data-formatter.service";

@Component({
  /* tslint:disable component-selector */
  selector: "[ec-future-income-list]",
  template: `
      <tr class="section-heading">
        <td [attr.colspan]="nbrOfColumns()">
          Incomes
        </td>
      </tr>
      <tr class="heading">
        <th>Income</th>
        <th *ngFor="let budget of budgets; trackBy: trackById">
          <a [routerLink]="['..', budget.id]"> {{budget.name}}</a>
        </th>
      </tr>
      <tr *ngFor="let incomeName of incomeNames">
        <td>{{incomeName}}</td>
        <td *ngFor="let budget of budgets; trackBy: trackById" class="right">
          {{ displayData[incomeName][budget.name] | ecMoney }}
        </td>
      </tr>
      <tr class="total">
        <th>Total Income</th>
        <th *ngFor="let budget of budgets" class="right">
           {{ totalFor(budget.name) | ecMoney }}
        </th>
      </tr>
  `,
  styles: []
})
export class FutureIncomeListComponent implements OnInit {

  @Input()
  get budgets(): BudgetData[] {
    return this._budgets;
  }

  set budgets(newBudgetList: BudgetData[]) {
    this._budgets = newBudgetList;
    this.updateDisplayData();
  }
  _budgets: BudgetData[] = [];
  displayData: any = {};
  incomeNames: string[] = [];

  constructor(private formatter: FutureBudgetsDataFormatterService) {}

  ngOnInit() {}

  nbrOfColumns() {
    return this.budgets.length + 1;
  }

  updateDisplayData() {
    this.displayData = this.formatter.formatIncomesForDisplay(this.budgets);
    this.incomeNames = Object.keys(this.displayData);
  }

  totalFor(budgetName: string) {
    let incomes = Object.keys(this.displayData).map(income => this.displayData[income]);
    return total(incomes, budgetName);
  }


  trackById(index: number, budget: BudgetData) {
    return budget.id;
  }
}
