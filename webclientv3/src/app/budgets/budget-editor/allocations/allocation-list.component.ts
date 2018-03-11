import {Component, Input, OnInit} from '@angular/core';
import {total} from "../../../util/total";
import {AllocationsByCategory, AllocationCategoryData, AllocationData} from "../../allocation.model";
import {groupBy} from 'lodash';
import {BudgetData} from "../../budget.model";
import {BudgetService} from "../../budget.service";

@Component({
  selector: 'ec-allocation-list',
  template: `
    <h1>Allocations</h1>
    <table class="table">
      <thead ec-allocation-list-header>
      </thead>
      <tbody>
        <ng-container *ngFor="let category of allocationsByCategory; trackBy: trackCategory">
          <tr class="heading">
            <td>{{category.name}}</td>
            <td class="right"><ec-money-field [value]="totalAmountFor(category)"></ec-money-field></td>
            <td class="right"><ec-money-field [value]="totalSpentFor(category)"></ec-money-field></td>
            <td class="right"><ec-money-field [value]="totalRemainingFor(category)" [highlightPositive]="true"></ec-money-field></td>
            <td></td>
            <td></td>
          </tr>
          <tr ec-allocation-category-row
              *ngFor="let allocation of category.allocations; trackBy: trackAllocation"
              [allocation]="allocation"
              [editMode]="editMode"
              [ecHighlightDeletedFor]="allocation"
          >
          </tr>
          <tr>
            <td colspan="5">
              <div class="category-button" *ngIf="editMode">
                <button mat-raised-button color="primary" (click)="addAllocation(category)">
                  Add {{category.name}} Allocation
                </button>
              </div>
            </td>
          </tr>
        </ng-container>
      </tbody>
      <tfoot ec-allocation-list-footer [budget]="budget"></tfoot>
    </table>
    <ec-allocation-list-summary [budget]="budget">
    </ec-allocation-list-summary>
  `,
  styles: [`
    .heading {
      font-weight: bold;
      font-size: 16px;
      border-top: 3px solid blue;
      border-bottom: 2px solid blue;
    }
    .footer {
      font-weight: bold;
      font-size: 18px;
      border-top: 2px solid grey;
      border-bottom: 2px solid grey;
    }
    .category-button {
      margin: 5px;
    }
  `]
})
export class AllocationListComponent implements OnInit {

  @Input() editMode = false;
  @Input() get budget(): BudgetData {
    return this._budget;
  }
  set budget(newBudget: BudgetData) {
    this._budget = newBudget;
    this.updateGroupings();
  }
  _budget: BudgetData = { allocations: [], incomes: [] };

  get allocationCategories(): AllocationCategoryData[] {
    return this._allocationCategories;
  }

  set allocationCategories(newCategories: AllocationCategoryData[]) {
    this._allocationCategories = newCategories;
    this.updateGroupings();
  }

  private _allocationCategories: AllocationCategoryData[] = [];
  allocationsByCategory: AllocationsByCategory[];

  constructor(
    private budgetService: BudgetService
  ) { }

  ngOnInit() {
    this.budgetService
        .getAllocationCategories()
        .subscribe(categories => this.allocationCategories = categories);
  }

  trackCategory(index: number, category: AllocationsByCategory) {
    if (!category) {
      return 10;
    }
    return category.id;
  }

  trackAllocation(index: number, allocation: AllocationData) {
    if (!allocation) {
      return 11;
    }
    return allocation.id;
  }

  updateGroupings() {
    let groupedCategories = groupBy(this.budget.allocations, 'allocation_category_id');
    this.allocationsByCategory = this.allocationCategories.map(category => {
      return {
        id: category.id,
        name: category.name,
        allocations: groupedCategories[category.id] || []
      };
    });
  }

  addAllocation(category: AllocationsByCategory) {
    const newAllocation: AllocationData = {
      id: null,
      name: '',
      amount: 0,
      spent: 0,
      budget_id: this.budget.id,
      allocation_category_id: category.id,
    };
    this.budget.allocations.push(newAllocation);
    category.allocations.push(newAllocation);
  }

  totalAmountFor(category: AllocationsByCategory): number {
    return total(category.allocations, 'amount');
  }

  totalSpentFor(category: AllocationsByCategory): number {
    return total(category.allocations, 'spent');

  }
  totalRemainingFor(category: AllocationsByCategory): number {
    return this.totalAmountFor(category) - this.totalSpentFor(category);
  }
}
