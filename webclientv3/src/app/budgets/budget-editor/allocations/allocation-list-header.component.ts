import { Component, OnInit } from '@angular/core';

@Component({ /* tslint:disable component-selector */
  selector: '[ec-allocation-list-header]',
  template: `
    <tr class="heading">
      <th style="width:25%;">Name</th>
      <th style="width:15%;" class="right">Amount</th>
      <th style="width:15%;" class="right">Spent</th>
      <th style="width:15%;" class="right">Remaining</th>
      <th style="width:25%;" class="hidden-xs">
        <span> Comment </span>
        <!--<span ng-show="vm.showStandingOrders"> Standing Orders </span>-->
        <!--<span ng-hide="vm.showStandingOrders"> Comment </span>-->
      </th>
      <th style="width:5%;"></th>
    </tr>
  `,
  styles: []
})
export class AllocationListHeaderComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
