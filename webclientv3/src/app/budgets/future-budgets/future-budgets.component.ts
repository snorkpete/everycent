import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { MessageService } from "../../message-display/message.service";
import { MainToolbarService } from "../../shared/main-toolbar/main-toolbar.service";
import { BudgetData } from "../budget.model";
import { BudgetService } from "../budget.service";
import { FutureAllocationListComponent } from "./allocations/future-allocation-list.component";
import { BudgetMassEditFormComponent } from "./mass-edit/budget-mass-edit-form.component";
import { FutureIncomeListComponent } from "./incomes/future-income-list.component";

@Component({
  selector: "ec-future-budgets",
  template: `
    <mat-card class="main">
      <mat-card-content>
        <mat-card>
          <table class="table">
            <tbody ec-future-income-list [budgets]="budgets" (save)="massSave($event)">
            </tbody>
            <tbody ec-future-allocation-list [budgets]="budgets" (save)="massSave($event)">
            </tbody>
            <tfoot ec-future-budget-summary [budgets]="budgets">
            </tfoot>
          </table>
        </mat-card>
      </mat-card-content>
    </mat-card>
  `,
  styles: []
})
export class FutureBudgetsComponent implements OnInit {
  budgets: BudgetData[] = [];

  @ViewChild(FutureIncomeListComponent) incomeList: FutureIncomeListComponent;

  @ViewChild(FutureAllocationListComponent)
  allocationList: FutureAllocationListComponent;

  constructor(
    private toolbar: MainToolbarService,
    private budgetService: BudgetService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.toolbar.setHeading("Future Budgets");
    this.refresh();
  }

  refresh() {
    this.budgetService
      .getFutureBudgets()
      .subscribe(budgets => (this.budgets = budgets));
  }

  massSave(massEditData: any) {
    this.budgetService.massSave(massEditData).subscribe(
      () => {
        this.messageService.setMessage("Updates saved.");
        this.refresh();
        this.incomeList.closeDialog();
        this.allocationList.closeDialog();
      },
      error => {
        this.messageService.setErrorMessage("Updates not saved.");
        this.refresh();
      }
    );
  }
}
