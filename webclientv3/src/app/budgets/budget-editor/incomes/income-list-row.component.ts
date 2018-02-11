import {Component, Input, OnInit} from '@angular/core';
import {BankAccountData} from "../../../bank-accounts/bank-account.model";
import {IncomeData} from "../../income.model";

@Component({ /* tslint:disable component-selector */
  selector: '[ec-income-list-row]',
  template: `
    <td>
      <ec-text-field [editMode]="editMode" [(ngModel)]="income.name"></ec-text-field>
    </td>

    <td class="right">
      <ec-money-field [editMode]="editMode" [(ngModel)]="income.amount"></ec-money-field>
    </td>

    <td>
      <ec-list-field [editMode]="editMode" [items]="bankAccounts" [(ngModel)]="income.bank_account_id">
      </ec-list-field>
    </td>

    <td>
      <ec-text-field [editMode]="editMode" [(ngModel)]="income.comment"></ec-text-field>
    </td>

    <td>
      <ec-delete-button [editMode]="editMode" [item]="income"></ec-delete-button>
    </td>
  `,
  styles: []
})
export class IncomeListRowComponent implements OnInit {

  @Input() income: IncomeData;
  @Input() editMode: boolean;
  @Input() bankAccounts: BankAccountData[] = [];

  constructor( ) { }

  ngOnInit() {
  }

}
