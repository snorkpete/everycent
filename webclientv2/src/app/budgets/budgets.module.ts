import {NgModule} from "@angular/core";
import {SharedModule} from "../shared/shared.module";
import {routing} from "./budgets.routing";
import {BudgetsComponent} from "./budgets.component";
import {BudgetListComponent} from "./budget-list.component";
import {BudgetService} from "./budget.service";
import {BudgetEditorComponent} from "./budget-editor.component";
import {IncomeListEditorComponent} from "./income-list-editor.component";
@NgModule({
  imports: [
    SharedModule,
    routing
  ],
  declarations:[
    BudgetsComponent,
    BudgetListComponent,
    BudgetEditorComponent,

    IncomeListEditorComponent,
  ],
  exports:[

  ],
  providers: [BudgetService]
})
export class BudgetsModule{}
