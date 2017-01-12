import {NgModule} from "@angular/core";
import {SharedModule} from "../shared/shared.module";
import {routing} from "./budgets.routing";
import {BudgetsComponent} from "./budgets.component";
import {BudgetListComponent} from "./budget-list.component";
import {BudgetService} from "./budget.service";
import {BudgetEditorComponent} from "./budget-editor.component";
import {IncomeListEditorComponent} from "./income-editor/income-list-editor.component";
import {IncomeListEditorRowComponent} from "./income-editor/income-list-editor-row.component";
import {IncomeListEditorHeaderRowComponent} from "./income-editor/income-list-editor-header-row.component";
import {IncomeListEditorFooterRowComponent} from "./income-editor/income-list-editor-footer-row.component";
import {IncomeListEditorActionsComponent} from "./income-editor/income-list-editor-actions.component";
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
    IncomeListEditorHeaderRowComponent,
    IncomeListEditorFooterRowComponent,
    IncomeListEditorComponent,
    IncomeListEditorActionsComponent,
  ],
  exports:[

  ],
  providers: [BudgetService]
})
export class BudgetsModule{}
