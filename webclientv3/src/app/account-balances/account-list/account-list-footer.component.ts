import {Component, Input, OnChanges, OnInit, SimpleChanges} from "@angular/core";
import {BankAccountData} from "../bank-account.model";

@Component({
  selector: 'ec-account-list-header',
  template: `
    <div fxLayout="row">
      <div fxFlex="1"></div>
      <div fxFlex="1">Name</div>
      <div fxFlex="1">Institution</div>
      <div fxFlex="1">Account Type</div>
      <div fxFlex="1">Category</div>
      <div fxFlex="1">
        Balance At: <em>{{ firstBankAccount?.closing_date | date:'MMM dd' }}</em>
      </div>
      <div fxFlex="1">
        Balance At: <em>{{ firstBankAccount?.next_closing_date | date:'MMM dd' }}</em>
      </div>
      <div fxFlex="1">Current Balance</div>
    </div>
  `
})
export class AccountListHeaderComponent implements OnInit, OnChanges {
  @Input() bankAccounts: BankAccountData[];
  firstBankAccount: BankAccountData = { };

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.bankAccounts && this.bankAccounts[0]) {
      this.firstBankAccount = this.bankAccounts[0];
    } else {
      this.firstBankAccount = {};
    }
  }
}
