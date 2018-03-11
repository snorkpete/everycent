import {Component, Input, OnInit} from '@angular/core';
import {total} from "../../../util/total";
import {AllocationCategoryData} from "../../allocation.model";
import {BudgetData} from "../../budget.model";
import {BudgetService} from "../../budget.service";
import {FutureBudgetsDataFormatterService} from "../future-budgets-data-formatter.service";

@Component({
  selector: 'ec-future-allocation-list',
  template: `
    <h1>Allocations</h1>
    <table class="table">
      <thead>
      <tr>
        <th>Allocation</th>
        <th *ngFor="let budget of budgets; trackBy: trackById">
          <a [routerLink]="['..', budget.id]"> {{budget.name}}</a>
        </th>
      </tr>
      </thead>
      <tbody>
      <ng-container *ngFor="let category of allocationCategories; trackBy: trackById">
        <tr class="heading">
          <td>{{category.name}}</td>
          <td *ngFor="let budget of budgets; trackBy: trackById" class="right">
            {{ totalFor(category, budget.name) | ecMoney }}
          </td>
        </tr>
        <tr *ngFor="let allocationName of allocationNames(category)">
          <td>{{allocationName}}</td>
          <td *ngFor="let budget of budgets; trackBy: trackById" class="right">
            {{ getAmountForAllocationAndBudget(category, allocationName, budget) | ecMoney }}
          </td>
        </tr>
        <!--<tr ec-allocation-category-row-->
            <!--*ngFor="let allocation of category.allocations; trackBy: trackAllocation"-->
            <!--[allocation]="allocation"-->
            <!--[editMode]="editMode"-->
            <!--[ecHighlightDeletedFor]="allocation"-->
        <!--&gt;-->
        <!--</tr>-->
      </ng-container>
      </tbody>
      <!--<tfoot ec-allocation-list-footer [budget]="budget"></tfoot>-->
    </table>
  `,
  styles: [`
    .heading {
      font-weight: bold;
      font-size: 16px;
      border-top: 3px solid blue;
      border-bottom: 2px solid blue;
    }
  `]
})
export class FutureAllocationListComponent implements OnInit {

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

  constructor(
    private budgetService: BudgetService,
    private formatter: FutureBudgetsDataFormatterService
  ) { }

  ngOnInit() {
    this.budgetService
      .getAllocationCategories()
      .subscribe(categories => this.allocationCategories = categories);
  }


  updateDisplayData() {
    this.displayData = this.formatter.formatAllocationsForDisplay(this.budgets);
  }

  allocationNames(category: AllocationCategoryData) {

    let data = this.displayData[category.id];
    if(!data) {
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

    return dataForAllocation[budget.name] || 0;
  }

  totalFor(category, budgetName: string) {
    let categoryData = this.displayData[category.id] || {};
    let allocations = Object.keys(categoryData).map(allocation => categoryData[allocation] || {});
    return total(allocations, budgetName);
  }

  trackById(index: number, budget: BudgetData) {
    return budget.id;
  }
}
