import {NgModule} from "@angular/core";
import {SharedModule} from "../shared/shared.module";
import {routing} from "./budgets.routing";
import {BudgetsComponent} from "./budgets.component";
import {BudgetListComponent} from "./budget-list.component";
import {BudgetService} from "./budget.service";
@NgModule({
  imports: [
    SharedModule,
    routing
  ],
  declarations:[
    BudgetsComponent,
    BudgetListComponent
  ],
  exports:[

  ],
  providers: [BudgetService]
})
export class BudgetsModule{}
