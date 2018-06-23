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
          {{ getAmountForIncomeAndBudget(incomeName, budget).amount | ecMoney }}
        </td>
      </tr>
      <tr class="total">
        <th>Total Income</th>
        <th *ngFor="let budget of budgets" class="right">
           {{ totalFor(budget.name) | ecMoney }}
        </th>
      </tr>
  `,
  styles: [
    `
    a {
      cursor: pointer;
      text-decoration: none;
      color: rgba(0,0,0,.74);
    }
    a:hover {
      text-decoration: underline;
      color: blue;
    }
  `
  ]
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

  getAmountForIncomeAndBudget(incomeName: string, budget: BudgetData) {
    let data = (this.displayData[incomeName] &&
      this.displayData[incomeName][budget.name]) || { id: 0, amount: 0 };

    return data;
  }

  totalFor(budgetName: string) {
    let incomes = Object.keys(this.displayData).map(
      income => this.displayData[income]
    );

    return this.totalByBudget(incomes, budgetName);
  }

  totalByBudget(incomes, budgetName): number {
    return incomes.reduce((sum, income) => {
      // skip any items that don't have the property
      if (!income[budgetName]) {
        return sum;
      }

      return sum + (income[budgetName] && income[budgetName].amount);
    }, 0);
  }

  trackById(index: number, budget: BudgetData) {
    return budget.id;
  }
}
