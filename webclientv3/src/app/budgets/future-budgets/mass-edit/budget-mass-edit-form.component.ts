import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialogRef } from "@angular/material";
import { total } from "../../../util/total";
import { BudgetData } from "../../budget.model";

@Component({
  selector: "ec-budget-mass-edit-form",
  template: `
    <h1 mat-dialog-title>Mass Edit Allocation</h1>
    <div mat-dialog-content>
      <div [formGroup]="form">
        <table class="table">
          <thead>
          <tr>
            <th>Allocation</th>
            <th *ngFor="let budget of budgets;">{{ budget.name }}</th>
          </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <ec-text-field [editMode]="true" formControlName="name"></ec-text-field>
              </td>
              <td formArrayName="amounts" *ngFor="let budget of budgets; let i = index;">
                <div [formGroupName]="i">
                  <ec-money-field [editMode]="true" formControlName="amount"></ec-money-field>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                Total Income
              </td>
              <td formArrayName="amounts" *ngFor="let budget of budgets; let i = index;">
                <div [formGroupName]="i">
                  <ec-money-field [editMode]="false" formControlName="budgetIncome"></ec-money-field>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                Other Allocations
              </td>
              <td formArrayName="amounts" *ngFor="let budget of budgets; let i = index;">
                <div [formGroupName]="i">
                  <ec-money-field [editMode]="false" formControlName="totalBudgetAllocationsWithoutCurrent"></ec-money-field>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                Unallocated
              </td>
              <td *ngFor="let budget of budgets; let i = index;">
                <ec-money-field [editMode]="false" [value]="difference(i)" [highlightPositive]="true"></ec-money-field>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div mat-dialog-actions>
      <ec-edit-actions [editMode]="true"
                       (save)="saveChanges()"
                       (cancel)="cancelChanges()"
      >
      </ec-edit-actions>
    </div>
  `,
  styles: []
})
export class BudgetMassEditFormComponent implements OnInit {
  @Output() save = new EventEmitter();
  @Output() cancel = new EventEmitter();

  allocationName = "";
  allocation_category_id = 0;
  displayData: any = {};
  budgets: BudgetData[] = [];

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<BudgetMassEditFormComponent>
  ) {}

  ngOnInit() {
    // this.form = this.fb.group({ name: "" });
  }

  createForm() {
    let amountsWithIds = this.budgets.map(budget => {
      let currentAllocationInfo = this.displayData[budget.name] || {
        id: 0,
        amount: 0
      };
      currentAllocationInfo.budget_id = budget.id;
      currentAllocationInfo.originalAmount = currentAllocationInfo.amount;
      currentAllocationInfo.budgetIncome = total(budget.incomes, "amount");
      currentAllocationInfo.totalBudgetAllocationsWithoutCurrent =
        total(budget.allocations, "amount") -
        currentAllocationInfo.originalAmount;
      return currentAllocationInfo;
    });
    let amounts = amountsWithIds.map(data => {
      return this.fb.group({
        id: data.id,
        amount: data.amount,
        budget_id: data.budget_id,
        originalAmount: data.originalAmount,
        budgetIncome: data.budgetIncome,
        totalBudgetAllocationsWithoutCurrent:
          data.totalBudgetAllocationsWithoutCurrent
      });
    });
    this.form = this.fb.group({
      type: "allocation",
      name: this.allocationName,
      allocation_category_id: this.allocation_category_id,
      amounts: this.fb.array(amounts)
    });
  }

  difference(i: number): number {
    let currentData = this.form.value.amounts[i];
    return (
      currentData.budgetIncome -
      currentData.totalBudgetAllocationsWithoutCurrent -
      currentData.amount
    );
  }

  saveChanges() {
    this.save.emit(this.form.value);
    this.save.complete();
  }

  cancelChanges() {
    this.cancel.emit();
    this.cancel.complete();
    this.dialogRef.close();
  }
}
