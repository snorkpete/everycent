import { Component, OnInit } from '@angular/core';
import {MainToolbarService} from "../../shared/main-toolbar/main-toolbar.service";
import {BudgetData} from "../budget.model";
import {BudgetService} from "../budget.service";

@Component({
  selector: 'ec-future-budgets',
  template: `
    <mat-card class="main">
      <mat-card-content>
        <mat-card>
          <table class="table">
            <tbody ec-future-income-list [budgets]="budgets">
            </tbody>
            <tbody ec-future-allocation-list [budgets]="budgets">
            </tbody>
            <tfoot ec-future-budget-summary [budgets]="budgets">
            </tfoot>
          </table>
        </mat-card>
      </mat-card-content>
    </mat-card>
  `,
  styles: []
})
export class FutureBudgetsComponent implements OnInit {

  budgets: BudgetData[] = [];

  constructor(
    private toolbar: MainToolbarService,
    private budgetService: BudgetService
  ) { }

  ngOnInit() {
    this.toolbar.setHeading('Future Budgets');
    this.budgetService.getFutureBudgets().subscribe(budgets => this.budgets = budgets);
  }

}
