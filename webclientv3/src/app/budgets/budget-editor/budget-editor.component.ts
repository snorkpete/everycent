import {Component, Input, OnInit} from '@angular/core';
import {BudgetData} from "../budget.model";

@Component({
  selector: 'ec-budget-editor',
  template: `
    <mat-card>
      <mat-card-content>
        <ec-income-list [budget]="budget" [editMode]="editMode"></ec-income-list>
        <ec-allocation-list [budget]="budget" [editMode]="editMode"></ec-allocation-list>
      </mat-card-content>
    </mat-card>
  `,
  styles: []
})
export class BudgetEditorComponent implements OnInit {

  @Input() budget: BudgetData = { incomes: [], allocations: [] };
  @Input() editMode = false;
  constructor() { }

  ngOnInit() {
  }

}
