import {Component, Input, OnInit} from '@angular/core';
import {BudgetData} from "../budget.model";

@Component({
  selector: 'ec-budget-editor',
  template: `
    <mat-card>
      <mat-card-content>
        <ec-income-list [incomes]="budget.incomes" [editMode]="editMode"></ec-income-list>
        <!--<ec-allocation-list [allocations]="budget.allocations"></ec-allocation-list>-->
      </mat-card-content>
    </mat-card>
    <p>
      budget-editor works!
    </p>
  `,
  styles: []
})
export class BudgetEditorComponent implements OnInit {

  @Input() budget: BudgetData;
  @Input() editMode = false;
  constructor() { }

  ngOnInit() {
  }

}
