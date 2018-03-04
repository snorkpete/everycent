import {Component, Input, OnInit} from '@angular/core';
import {BudgetData} from "../../budget.model";

@Component({
  selector: 'ec-future-allocation-list',
  template: `
    <p>
      future-allocation-list works!
    </p>
  `,
  styles: []
})
export class FutureAllocationListComponent implements OnInit {

  @Input() budgets: BudgetData[] = [];
  constructor() { }

  ngOnInit() {
  }

}
