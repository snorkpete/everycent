import {Component, Input, OnInit} from '@angular/core';
import {BankAccountData} from "../../../bank-accounts/bank-account.model";
import {BankAccountService} from "../../../bank-accounts/bank-account.service";
import {BudgetData} from "../../budget.model";
import {IncomeData} from "../../income.model";

@Component({
  selector: 'ec-income-list',
  template: `
    <h1>Incomes</h1>
    <table class="table">
      <thead ec-income-list-header>
      </thead>
      <tbody>
        <tr ec-income-list-row
            *ngFor="let income of budget.incomes"
            [income]="income"
            [editMode]="editMode"
            [bankAccounts]="bankAccounts"
            [ecHighlightDeletedFor]="income">
        </tr>
        <tr>
          <td colspan="5">
            <div class="category-button" *ngIf="editMode">
              <button mat-raised-button color="primary" (click)="addNewIncome()">
                Add Income
              </button>
            </div>
          </td>
        </tr>
      </tbody>
      <tfoot ec-income-list-footer [incomes]="budget.incomes">
      </tfoot>
    </table>
  `,
  styles: [`
    .category-button {
      margin: 5px;
    }
  `]
})
export class IncomeListComponent implements OnInit {

  @Input() budget: BudgetData = { incomes: [], allocations: []};
  @Input() editMode: boolean;
  bankAccounts: BankAccountData[] = [];

  constructor(
    private bankAccountService: BankAccountService
  ) { }

  ngOnInit() {
    this.bankAccountService.getBankAccounts()
      .subscribe( bankAccounts => this.bankAccounts = bankAccounts );
  }

  addNewIncome(): void {
    let newIncome: IncomeData = {
      id: 0,
      name: '',
      amount: 0,
      budget_id: this.budget.id,
      bank_account_id: 0
    };
    this.budget.incomes.push(newIncome);
  }
}
