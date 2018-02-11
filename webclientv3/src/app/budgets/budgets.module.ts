import {NgModule} from '@angular/core';
import {SharedModule} from "../shared/shared.module";
import {BudgetService} from "./budget.service";

import {BudgetsRoutingModule} from './budgets-routing.module';
import {BudgetsComponent} from './budgets/budgets.component';
import { BudgetListComponent } from './budget-list/budget-list.component';
import { BudgetComponent } from './budget/budget.component';
import { BudgetEditorComponent } from './budget-editor/budget-editor.component';
import { IncomeListComponent } from './budget-editor/incomes/income-list.component';
import { IncomeListHeaderComponent } from './budget-editor/incomes/income-list-header.component';
import { IncomeListRowComponent } from './budget-editor/incomes/income-list-row.component';
import { IncomeListFooterComponent } from './budget-editor/incomes/income-list-footer.component';

@NgModule({
  imports: [
    SharedModule,
    BudgetsRoutingModule,
  ],
  declarations: [BudgetsComponent, BudgetListComponent, BudgetComponent, BudgetEditorComponent, IncomeListComponent, IncomeListHeaderComponent, IncomeListRowComponent, IncomeListFooterComponent],
  providers: [
    BudgetService,
  ]
})
export class BudgetsModule { }
