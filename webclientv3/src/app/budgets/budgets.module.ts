import {NgModule} from '@angular/core';
import {SharedModule} from "../shared/shared.module";
import {BudgetService} from "./budget.service";

import {BudgetsRoutingModule} from './budgets-routing.module';
import {BudgetsComponent} from './budgets/budgets.component';
import { BudgetListComponent } from './budget-list/budget-list.component';
import { BudgetComponent } from './budget/budget.component';
import { BudgetEditorComponent } from './budget-editor/budget-editor.component';

@NgModule({
  imports: [
    SharedModule,
    BudgetsRoutingModule,
  ],
  declarations: [BudgetsComponent, BudgetListComponent, BudgetComponent, BudgetEditorComponent],
  providers: [
    BudgetService,
  ]
})
export class BudgetsModule { }
