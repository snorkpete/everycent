import {NgModule} from "@angular/core";
import {SharedModule} from "../shared/shared.module";
import {routing} from "./budgets.routing";
import {BudgetsComponent} from "./budgets.component";
import {BudgetListComponent} from "./budget-list.component";
import {BudgetService} from "./budget.service";
import {BudgetEditorComponent} from "./budget-editor.component";
import {IncomeListEditorComponent} from "./income-editor/income-list-editor.component";
import {IncomeListEditorRowComponent} from "./income-editor/income-list-editor-row.component";
@NgModule({
  imports: [
    SharedModule,
    routing
  ],
  declarations:[
    BudgetsComponent,
    BudgetListComponent,
    BudgetEditorComponent,

    IncomeListEditorRowComponent,
    IncomeListEditorComponent,
  ],
  exports:[

  ],
  providers: [BudgetService]
})
export class BudgetsModule{}
