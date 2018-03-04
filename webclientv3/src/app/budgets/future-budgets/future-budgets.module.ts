import { NgModule } from '@angular/core';
import {SharedModule} from "../../shared/shared.module";
import {FutureAllocationListComponent} from "./allocations/future-allocation-list.component";
import {FutureBudgetsDataFormatterService} from "./future-budgets-data-formatter.service";
import {FutureBudgetsComponent} from "./future-budgets.component";
import {FutureIncomeListComponent} from "./incomes/future-income-list.component";

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [

    FutureBudgetsComponent,
    FutureIncomeListComponent,
    FutureAllocationListComponent
  ],
  providers: [
    FutureBudgetsDataFormatterService
  ]
})
export class FutureBudgetsModule { }
