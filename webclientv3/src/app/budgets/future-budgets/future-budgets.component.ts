import { Component, OnInit } from '@angular/core';
import {BudgetData} from "../budget.model";
import {BudgetService} from "../budget.service";

@Component({
  selector: 'ec-future-budgets',
  template: `
    <div fxLayout="row">
      <ec-budget-editor *ngFor="let budget of budgets" [budget]="budget" [simpleView]="true">
      </ec-budget-editor>
    </div>
  `,
  styles: []
})
export class FutureBudgetsComponent implements OnInit {

  budgets: BudgetData[] = [];

  constructor(
    private budgetService: BudgetService
  ) { }

  ngOnInit() {
    this.budgetService.getFutureBudgets().subscribe(budgets => this.budgets = budgets);
  }

}
