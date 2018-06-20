import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material";
import { total } from "../../../util/total";
import { AllocationCategoryData } from "../../allocation.model";
import { BudgetData } from "../../budget.model";
import { BudgetService } from "../../budget.service";
import { FutureBudgetsDataFormatterService } from "../future-budgets-data-formatter.service";
import { BudgetMassEditFormComponent } from "../mass-edit/budget-mass-edit-form.component";

@Component({
  /* tslint:disable component-selector */
  selector: "[ec-future-allocation-list]",
  template: `
      <tr class="section-heading">
        <td [attr.colspan]="nbrOfColumns()">Allocations</td>
      </tr>
      <tr>
        <th>Allocation</th>
        <th *ngFor="let budget of budgets; trackBy: trackById">
          <a [routerLink]="['..', budget.id]"> {{budget.name}}</a>
        </th>
      </tr>
      <ng-container *ngFor="let category of allocationCategories; trackBy: trackById">
        <tr class="heading">
          <td>{{category.name}}</td>
          <td *ngFor="let budget of budgets; trackBy: trackById" class="right">
            {{ totalFor(category, budget.name) | ecMoney }}
          </td>
        </tr>
        <tr *ngFor="let allocationName of allocationNames(category)">
          <td><a (click)="massEditAllocation(category, allocationName)">{{allocationName}}</a></td>
          <td *ngFor="let budget of budgets; trackBy: trackById" class="right">
            {{ getAmountForAllocationAndBudget(category, allocationName, budget).amount | ecMoney }}
          </td>
        </tr>
      </ng-container>
      <tr class="total">
        <th>Total Allocations</th>
        <th *ngFor="let budget of budgets; let i = index; trackBy: trackById" class="right">
          {{ totalForBudget(i) | ecMoney }}
        </th>
      </tr>
  `,
  styles: [
    `
    .heading {
      font-weight: bold;
      font-size: 16px;
      border-top: 3px solid blue;
      border-bottom: 2px solid blue;
    }

    a {
      cursor: pointer;
      text-decoration: underline;
    }
  `
  ]
})
export class FutureAllocationListComponent implements OnInit {
  @Output() save = new EventEmitter();
  @Input()
  get budgets(): BudgetData[] {
    return this._budgets;
  }

  set budgets(newBudgetList: BudgetData[]) {
    this._budgets = newBudgetList;
    this.updateDisplayData();
  }
  _budgets: BudgetData[] = [];

  get allocationCategories(): AllocationCategoryData[] {
    return this._allocationCategories;
  }

  set allocationCategories(newCategories: AllocationCategoryData[]) {
    this._allocationCategories = newCategories;
    // this.updateDisplayData();
  }

  private _allocationCategories: AllocationCategoryData[] = [];
  displayData: any = {};
  dialogRef: MatDialogRef<BudgetMassEditFormComponent>;

  constructor(
    private budgetService: BudgetService,
    private formatter: FutureBudgetsDataFormatterService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.budgetService
      .getAllocationCategories()
      .subscribe(categories => (this.allocationCategories = categories));
  }

  updateDisplayData() {
    this.displayData = this.formatter.formatAllocationsForDisplay(this.budgets);
  }

  nbrOfColumns() {
    return this.budgets.length + 1;
  }

  allocationNames(category: AllocationCategoryData) {
    let data = this.displayData[category.id];
    if (!data) {
      return [];
    }

    return Object.keys(data);
  }

  getAmountForAllocationAndBudget(category, allocationName, budget) {
    let dataForCategory = this.displayData[category.id];
    if (!dataForCategory) {
      return 0;
    }
    let dataForAllocation = dataForCategory[allocationName];
    if (!dataForAllocation) {
      return 0;
    }

    return (
      (dataForAllocation[budget.name] && dataForAllocation[budget.name]) || {
        id: 0,
        amount: 0
      }
    );
  }

  totalFor(category, budgetName: string) {
    let categoryData = this.displayData[category.id] || {};
    let allocations = Object.keys(categoryData).map(
      allocation => categoryData[allocation] || {}
    );
    return this.totalByBudget(allocations, budgetName);
  }

  totalByBudget(allocations, budgetName): number {
    return allocations.reduce((sum, allocation) => {
      // skip any items that don't have the property
      if (!allocation[budgetName]) {
        return sum;
      }

      return sum + (allocation[budgetName] && allocation[budgetName].amount);
    }, 0);
  }
  totalForBudget(index: number) {
    let budget = this.budgets[index];
    return total(budget.allocations, "amount");
  }

  trackById(index: number, budget: BudgetData) {
    return budget.id;
  }

  massEditAllocation(category: AllocationCategoryData, allocationName: string) {
    this.dialogRef = this.dialog.open(BudgetMassEditFormComponent, {
      maxHeight: 600
    });

    const form = this.dialogRef.componentInstance;
    form.allocationName = allocationName;
    form.displayData = this.displayData[category.id][allocationName];
    form.budgets = this.budgets;
    form.allocation_category_id = category.id;
    form.createForm();

    form.save.subscribe(massEditData => this.save.emit(massEditData));
  }

  closeDialog() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}
