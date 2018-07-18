import { Component, Input, OnInit } from "@angular/core";
import { BankAccountData } from "../../bank-accounts/bank-account.model";

@Component({
  /* tslint:disable component-selector */
  selector: "[ec-transaction-list-header]",
  template: `
  `,
  styles: [
    `
  `
  ]
})
export class TransactionListHeaderComponent implements OnInit {
  @Input() bankAccount: BankAccountData;
  constructor() {}

  ngOnInit() {}
}
