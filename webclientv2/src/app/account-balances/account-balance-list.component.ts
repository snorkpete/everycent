import {Component, Input} from "@angular/core";
import transactionTotal from "../shared/transaction-total.function";
import {Icons} from "../shared/icons.constants";

@Component({
  styles:[`
    .text-right{
        text-align: end;
    }
   
    table{
        margin-bottom: 20px; 
    }
  `],
  selector: 'ec-account-balance-list',
  template: `
    <ec-toolbar [title]="title" [icon]="Icons.ACCOUNT_BALANCE"></ec-toolbar>
    <table class="table table-bordered clear-background rounded" *ngIf="bankAccounts && bankAccounts.length > 0">
        <thead>
            <tr class="heading">
                <th width="20%">Name</th>
                <th class="hidden-xs">Institution</th>
                <th class="hidden-xs">Account Type</th>
                <th class="hidden-xs">Category</th>
                <th>
                    Balance At: <em>{{ bankAccounts[0].closing_date | date:'MMM dd' }}</em>

                </th>
                <th>Balance At: <em>{{ bankAccounts[0].next_closing_date | date:'MMM dd' }}</em>
                </th>
                <th>Current Balance</th>
            </tr>
        </thead>
        <tbody>
            <tr *ngFor="let bankAccount of bankAccounts">
                <td> {{ bankAccount.name }} </td>
                <td class="hidden-xs"> {{ bankAccount.institution.name }} </td>
                <td class="hidden-xs"> {{ bankAccount.account_type }} </td>
                <td class="hidden-xs"> {{ bankAccount.account_category }} </td>
                <td class="text-right"> {{ bankAccount.closing_balance | ecToDollars }} </td>
                <td class="text-right"> {{ bankAccount.expected_closing_balance | ecToDollars }} </td>
                <td class="text-right"> {{ bankAccount.current_balance | ecToDollars }} </td>

            </tr>
        </tbody>
        <tfoot>
            <tr class="total">
                <th class="hidden-xs text-right" colspan="4">Total</th>
                <th class="text-right">
                    {{ total(bankAccounts, 'closing_balance') | ecToDollars }}
                </th>
                <th class="text-right">
                    {{ total(bankAccounts, 'expected_closing_balance') | ecToDollars }}
                </th>
                <th class="text-right">
                    {{ total(bankAccounts, 'current_balance') | ecToDollars }}
                </th>
            </tr>
        </tfoot>
    </table>
  `
})
export class AccountBalanceListComponent {
  @Input() title = '';
  @Input() bankAccounts = [];

  Icons = Icons;
  public total = transactionTotal;

  constructor(

    //private
  ){}
}