import { Component, OnInit } from '@angular/core';
import {BudgetData} from "../budget.model";
import {BudgetService} from "../budget.service";

@Component({
  selector: 'ec-future-budgets',
  template: `
    <div class="main">
      <mat-card>
        <mat-card-content>
          <table class="table">
            <tbody ec-future-income-list [budgets]="budgets">
            </tbody>
            <tbody ec-future-allocation-list [budgets]="budgets">
            </tbody>
            <tfoot ec-future-budget-summary [budgets]="budgets">
            </tfoot>
          </table>
        </mat-card-content>
      </mat-card>
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
