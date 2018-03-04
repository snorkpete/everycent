import {Component, Input, OnInit} from '@angular/core';
import {BudgetData} from "../../budget.model";
import {FutureBudgetsDataFormatterService} from "../future-budgets-data-formatter.service";

@Component({
  selector: 'ec-future-allocation-list',
  template: `
    <h1>Allocations</h1>
    <table class="table">
      <thead>
      <tr>
        <th>Allocation</th>
        <th *ngFor="let budget of budgets; trackBy: trackById">{{budget.name}}</th>
      </tr>
      </thead>
      <tbody>
      <!--<ng-container *ngFor="let category of allocationsByCategory; trackBy: trackCategory">-->
        <!--<tr class="heading">-->
          <!--<td>{{category.name}}</td>-->
          <!--<td class="right"><ec-money-field [value]="totalAmountFor(category)"></ec-money-field></td>-->
          <!--<td class="right"><ec-money-field [value]="totalSpentFor(category)"></ec-money-field></td>-->
          <!--<td class="right"><ec-money-field [value]="totalRemainingFor(category)" [highlightPositive]="true"></ec-money-field></td>-->
          <!--<td></td>-->
          <!--<td></td>-->
        <!--</tr>-->
        <tr *ngFor="let allocationName of allocationNames">
          <td>{{allocationName}}</td>
          <td *ngFor="let budget of budgets; trackBy: trackById" class="right">
            {{ displayData[allocationName][budget.name] | ecMoney }}
          </td>
        </tr>
        <!--<tr ec-allocation-category-row-->
            <!--*ngFor="let allocation of category.allocations; trackBy: trackAllocation"-->
            <!--[allocation]="allocation"-->
            <!--[editMode]="editMode"-->
            <!--[ecHighlightDeletedFor]="allocation"-->
        <!--&gt;-->
        <!--</tr>-->
      <!--</ng-container>-->
      </tbody>
      <!--<tfoot ec-allocation-list-footer [budget]="budget"></tfoot>-->
    </table>
  `,
  styles: []
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
  displayData: any = {};
  allocationNames: string[] = [];

  constructor(
    private formatter: FutureBudgetsDataFormatterService
  ) { }

  ngOnInit() {
  }


  updateDisplayData() {
    this.displayData = this.formatter.formatAllocationsForDisplay(this.budgets);
    this.allocationNames = Object.keys(this.displayData);
  }
  trackById(index: number, budget: BudgetData) {
    return budget.id;
  }
}
