import {NgModule} from "@angular/core";
import {SharedModule} from "../shared/shared.module";
import {routing} from "./budgets.routing";
import {BudgetsComponent} from "./budgets.component";
@NgModule({
  imports: [
    SharedModule,
    routing
  ],
  declarations:[
    BudgetsComponent
  ],
  exports:[

  ]
})
export class BudgetsModule{}
