import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {BankAccountData} from "../bank-account.model";
import {total} from "../../util/total";

@Component({
  selector: 'ec-account-list',
  styles: [`
  `],
  template: `
    <md-card>
      <md-card-header>{{heading}}</md-card-header>
      <md-card-content>
        <table class="table">
          <thead>
          <tr>
            <th>Name</th>
            <th class="hidden-xs">Institution</th>
            <th class="hidden-xs">Account Type</th>
            <th class="hidden-xs">Category</th>
            <th>
              Balance At: <em>{{ firstBankAccount?.closing_date | date:'MMM dd' }}</em>

            </th>
            <th>Balance At: <em>{{ firstBankAccount?.next_closing_date | date:'MMM dd' }}</em>
            </th>
            <th>Current Balance</th>
          </tr>
          </thead>
          <tbody>
          
          <tr *ngFor="let bankAccount of bankAccounts">
            <td> {{ bankAccount?.name }} </td>
            <td class="hidden-xs"> {{ bankAccount?.institution?.name }} </td>
            <td class="hidden-xs"> {{ bankAccount?.account_type }} </td>
            <td class="hidden-xs"> {{ bankAccount?.account_category }} </td>
            <td class="text-right"> {{ bankAccount?.closing_balance | ecMoney }} </td>
            <td class="text-right"> {{ bankAccount?.expected_closing_balance | ecMoney }} </td>
            <td class="text-right"> {{ bankAccount?.current_balance | ecMoney }} </td>

          </tr>
          </tbody>
          <tfoot>
          
          <tr class="total">
            <th class="hidden-xs text-right" colspan="4">Total</th>
            <th class="visible-xs text-right">Total</th>
            <th class="text-right">
              {{ closingBalance() | ecMoney }}
            </th>
            <th class="text-right">
              {{ expectedClosingBalance() | ecMoney }}
            </th>
            <th class="text-right">
              {{ currentBalance() | ecMoney }}
            </th>
          </tr>
          </tfoot>
        </table>
      </md-card-content>
    </md-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountListComponent implements OnInit, OnChanges {

  @Input() heading = '';
  @Input() bankAccounts: BankAccountData[] = [];
  firstBankAccount: BankAccountData = { id: 0, name: ''};

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

  closingBalance() {
    return total(this.bankAccounts, 'closing_balance');
  }

  expectedClosingBalance() {
    return total(this.bankAccounts, 'expected_closing_balance');
  }

  currentBalance() {
    return total(this.bankAccounts, 'current_balance');
  }

}
