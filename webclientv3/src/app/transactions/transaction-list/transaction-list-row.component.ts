import { Component, Input, OnInit } from "@angular/core";
import { BankAccountData } from "../../bank-accounts/bank-account.model";
import { BudgetData } from "../../budgets/budget.model";
import { SinkFundAllocationData } from "../../sink-funds/sink-fund-allocation-data.model";
import { AllocationData } from "../allocation-data.model";
import { TransactionData } from "../transaction-data.model";

@Component({
  /* tslint:disable component-selector */
  selector: "[ec-transaction-list-row]",
  styles: [
    `
    td .mat-form-field-inline {
      width: auto;
    }
  `
  ],
  template: `
  `
})
export class TransactionListRowComponent implements OnInit {
  @Input() transaction: TransactionData;
  @Input() bankAccount: BankAccountData;
  @Input() budget: BudgetData;
  @Input() allocations: AllocationData[] = [];
  @Input() sinkFundAllocations: SinkFundAllocationData[] = [];
  @Input() editMode: boolean;

  constructor() {}

  ngOnInit() {}
}
