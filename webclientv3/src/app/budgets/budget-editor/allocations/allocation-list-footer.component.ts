import { Component, Input, OnInit } from "@angular/core";
import { total } from "../../../util/total";
import { AllocationData } from "../../allocation.model";
import { BudgetData } from "../../budget.model";

@Component({
  /* tslint:disable component-selector */
  selector: "[ec-allocation-list-footer]",
  template: `
    <tr class="heading">
      <td class="total">
        <span>Total</span>
        <span class="label">
          Unallocated: {{ totalDiscretionaryAmount() | ecMoney }}
        </span>
      </td>
      <td class="right">
        <ec-money-field [value]="totalAmount()"></ec-money-field>
      </td>
      <td class="right">
        <ec-money-field [value]="totalSpent()"></ec-money-field>
      </td>
      <td class="right">
        <ec-money-field [value]="totalRemaining()" [highlightPositive]="true"></ec-money-field>
      </td>
      <td></td>
      <td></td>
    </tr>
  `,
  styles: [
    `
    .heading {
      font-weight: bold;
      font-size: 18px;
    }
    .total {
      display: flex;
      justify-content: space-between;
    }
    .label {
      border-radius: 5px;
      border: 2px solid grey;
      background-color: darkgrey;
      font-size: 12px;
      color: white;
      padding-left: 5px;
      padding-right: 5px;
      padding-top: 3px;
    }
  `
  ]
})
export class AllocationListFooterComponent implements OnInit {
  @Input() budget: BudgetData = { incomes: [], allocations: [] };
  constructor() {}

  ngOnInit() {}

  totalAmount(): number {
    return total(this.budget.allocations, "amount");
  }

  totalSpent(): number {
    return total(this.budget.allocations, "spent");
  }
  totalRemaining(): number {
    return this.totalAmount() - this.totalSpent();
  }

  totalDiscretionaryAmount() {
    return (
      total(this.budget.incomes, "amount") -
      total(this.budget.allocations, "amount")
    );
  }
}
