import {Component, Input, OnInit} from '@angular/core';
import {BankAccountData} from "../../../bank-accounts/bank-account.model";
import {BankAccountService} from "../../../bank-accounts/bank-account.service";
import {IncomeData} from "../../income.model";

@Component({
  selector: 'ec-income-list',
  template: `
    <table class="table table-bordered rounded">
      <thead ec-income-list-header>
      </thead>
      <tbody>
        <tr ec-income-list-row
            *ngFor="let income of incomes"
            [income]="income"
            [editMode]="editMode"
            [bankAccounts]="bankAccounts"
            [ecHighlightDeletedFor]="income">
        </tr>
      </tbody>
      <tfoot ec-income-list-footer [incomes]="incomes">
      </tfoot>
    </table>
  `,
  styles: []
})
export class IncomeListComponent implements OnInit {

  @Input() incomes: IncomeData[];
  @Input() editMode: boolean;
  bankAccounts: BankAccountData[] = [];

  constructor(
    private bankAccountService: BankAccountService
  ) { }

  ngOnInit() {
    this.bankAccountService.getBankAccounts()
      .subscribe( bankAccounts => this.bankAccounts = bankAccounts );
  }

}
