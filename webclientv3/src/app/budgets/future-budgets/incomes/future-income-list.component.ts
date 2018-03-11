import {Component, Input, OnInit} from '@angular/core';
import {total} from "../../../util/total";
import {BudgetData} from "../../budget.model";
import {FutureBudgetsDataFormatterService} from "../future-budgets-data-formatter.service";

@Component({
  selector: 'ec-future-income-list',
  template: `
    <h1>Incomes</h1>
    <table class="table">
      <thead>
        <tr>
          <th>Income</th>
          <th *ngFor="let budget of budgets; trackBy: trackById">{{budget.name}}</th>
        </tr>
      </thead>
      <tbody>
      <tr *ngFor="let incomeName of incomeNames">
        <td>{{incomeName}}</td>
        <td *ngFor="let budget of budgets; trackBy: trackById" class="right">
          {{ displayData[incomeName][budget.name] | ecMoney }}
        </td>
      </tr>
      </tbody>
      <tfoot>
        <tr class="total">
          <th>Total</th>
          <th *ngFor="let budget of budgets" class="right">
             {{ totalFor(budget.name) | ecMoney }}
          </th>
        </tr>
      </tfoot>
    </table>
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


  constructor(
    private formatter: FutureBudgetsDataFormatterService
  ) { }

  ngOnInit() {
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
