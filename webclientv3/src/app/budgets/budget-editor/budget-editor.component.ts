import {Component, Input, OnInit} from '@angular/core';
import {BudgetData} from "../budget.model";

@Component({
  selector: 'ec-budget-editor',
  template: `
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
