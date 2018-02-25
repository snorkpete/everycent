import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import {SinkFundsModule} from "../sink-funds/sink-funds.module";
import { BudgetService } from "./budget.service";

import { BudgetsRoutingModule } from "./budgets-routing.module";
import { BudgetsComponent } from "./budgets/budgets.component";
import { BudgetListComponent } from "./budget-list/budget-list.component";
import { BudgetComponent } from "./budget/budget.component";
import { BudgetEditorComponent } from "./budget-editor/budget-editor.component";
import { IncomeListComponent } from "./budget-editor/incomes/income-list.component";
import { IncomeListHeaderComponent } from "./budget-editor/incomes/income-list-header.component";
import { IncomeListRowComponent } from "./budget-editor/incomes/income-list-row.component";
import { IncomeListFooterComponent } from "./budget-editor/incomes/income-list-footer.component";
import { AllocationListComponent } from "./budget-editor/allocations/allocation-list.component";
import { AllocationListHeaderComponent } from "./budget-editor/allocations/allocation-list-header.component";
import { AllocationCategoryRowComponent } from "./budget-editor/allocations/allocation-category-row.component";
import { AllocationListSummaryComponent } from "./budget-editor/allocations/allocation-list-summary.component";
import { AllocationListFooterComponent } from "./budget-editor/allocations/allocation-list-footer.component";

@NgModule({
  //TODO: to extract shared transaction module
  imports: [SharedModule, BudgetsRoutingModule, SinkFundsModule],
  declarations: [
    BudgetsComponent,
    BudgetListComponent,
    BudgetComponent,
    BudgetEditorComponent,
    IncomeListComponent,
    IncomeListHeaderComponent,
    IncomeListRowComponent,
    IncomeListFooterComponent,
    AllocationListComponent,
    AllocationListHeaderComponent,
    AllocationCategoryRowComponent,
    AllocationListSummaryComponent,
    AllocationListFooterComponent
  ],
  providers: [BudgetService]
})
export class BudgetsModule {}
