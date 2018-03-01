import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {BankAccountData} from "../bank-account.model";
import {total} from "../../util/total";

@Component({
  selector: 'ec-account-list',
  styles: [`
  `],
  template: `
    <mat-card>
      <mat-card-header>{{heading}}</mat-card-header>
      <mat-card-content>
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
              <td>
                <a [routerLink]="['..', 'transactions', {bank_account_id: bankAccount.id }]">
                  {{ bankAccount?.name }}</a>
              </td>
              <td class="hidden-xs"> {{ bankAccount?.institution?.name }} </td>
              <td class="hidden-xs"> {{ bankAccount?.account_type }} </td>
              <td class="hidden-xs"> {{ bankAccount?.account_category }} </td>
              <td class="right"> {{ bankAccount?.closing_balance | ecMoney }} </td>
              <td class="right"> {{ bankAccount?.expected_closing_balance | ecMoney }} </td>
              <td class="right"> {{ bankAccount?.current_balance | ecMoney }} </td>
            </tr>
          </tbody>
          <tfoot>

          <tr class="total">
            <th class="hidden-xs text-right" colspan="4">Total</th>
            <th class="right">
              {{ closingBalance() | ecMoney }}
            </th>
            <th class="right">
              {{ expectedClosingBalance() | ecMoney }}
            </th>
            <th class="right">
              {{ currentBalance() | ecMoney }}
            </th>
          </tr>
          </tfoot>
        </table>
      </mat-card-content>
    </mat-card>
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
