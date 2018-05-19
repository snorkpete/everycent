import { NgModule } from "@angular/core";
import { SharedTransactionsModule } from "../shared-transactions/shared-transactions.module";
import { SharedModule } from "../shared/shared.module";
import { AllocationCategoryRowComponent } from "./budget-editor/allocations/allocation-category-row.component";
import { AllocationListFooterComponent } from "./budget-editor/allocations/allocation-list-footer.component";
import { AllocationListHeaderComponent } from "./budget-editor/allocations/allocation-list-header.component";
import { AllocationListSummaryComponent } from "./budget-editor/allocations/allocation-list-summary.component";
import { AllocationListComponent } from "./budget-editor/allocations/allocation-list.component";
import { BudgetEditorComponent } from "./budget-editor/budget-editor.component";
import { IncomeListFooterComponent } from "./budget-editor/incomes/income-list-footer.component";
import { IncomeListHeaderComponent } from "./budget-editor/incomes/income-list-header.component";
import { IncomeListRowComponent } from "./budget-editor/incomes/income-list-row.component";
import { IncomeListComponent } from "./budget-editor/incomes/income-list.component";
import { BudgetListComponent } from "./budget-list/budget-list.component";
import { BudgetService } from "./budget.service";
import { BudgetComponent } from "./budget/budget.component";

import { BudgetsRoutingModule } from "./budgets-routing.module";
import { BudgetsComponent } from "./budgets/budgets.component";
import { FutureBudgetsModule } from "./future-budgets/future-budgets.module";

@NgModule({
  imports: [
    SharedModule,
    FutureBudgetsModule,
    BudgetsRoutingModule,
    SharedTransactionsModule
  ],
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
    AllocationListFooterComponent,
  ],
  providers: [
    BudgetService,
  ]
})
export class BudgetsModule {}
