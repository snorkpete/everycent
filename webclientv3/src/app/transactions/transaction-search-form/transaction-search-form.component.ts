import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BankAccountData} from "../../account-balances/bank-account.model";
import {BudgetData} from "../../budgets/budget.model";
import {TransactionSearchParams} from "./transaction-search-params.model";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {Observable} from "rxjs/Observable";
import {BankAccountService} from "../../bank-accounts/bank-account.service";
import {BudgetService} from "../../budgets/budget.service";

@Component({
  selector: 'ec-transaction-search-form',
  styles: [`
  `],
  template: `
    <form (ngSubmit)="onSubmit()" [formGroup]="form">
    <mat-card>

      <mat-card-title>Select Transactions to View</mat-card-title>
      <mat-card-content>

        <div fxLayout="column" fxLayoutGap="20px">

          <mat-form-field fxFlex>
            <mat-select placeholder="Bank Account" formControlName="bank_account_id">
              <mat-option *ngFor="let bankAccount of bankAccounts" [value]="bankAccount.id">{{bankAccount.name}}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field fxFlex>
            <mat-select placeholder="Budget" formControlName="budget_id">
              <mat-option *ngFor="let budget of budgets" [value]="budget.id">{{budget.name}}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        
      </mat-card-content>

      <mat-card-actions>
        <button mat-button type="submit" color="primary">Refresh</button>
      </mat-card-actions>
    </mat-card>
    </form>
  `
})
export class TransactionSearchFormComponent implements OnInit {

  bankAccounts: BankAccountData[] = [];
  budgets: BudgetData[] = [];
  @Output() change = new EventEmitter<TransactionSearchParams>();

  form: FormGroup;

  constructor(
    private bankAccountService: BankAccountService,
    private budgetService: BudgetService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      budget_id: 0,
      bank_account_id: 0
    });

    this.form.valueChanges.subscribe(v => {
      this.updateBudgetAndBankAccount(v);
      this.change.emit(v);
    });

    this.loadBudgetsAndBankAccounts();
  }

  updateBudgetAndBankAccount(searchParams: TransactionSearchParams) {
    if (!searchParams.bankAccount) {
      searchParams.bankAccount = this.bankAccounts.find(account => account.id === searchParams.bank_account_id);
    }

    if (!searchParams.budget) {
      searchParams.budget = this.bankAccounts.find(account => account.id === searchParams.budget_id);
    }
  }

  loadBudgetsAndBankAccounts() {
    Observable.combineLatest(
      this.bankAccountService.getBankAccounts(),
      this.budgetService.getBudgets(),
    ).subscribe((results) => {
      [this.bankAccounts, this.budgets] = results;
      this.setInitialValues();
    });

  }

  setInitialValues() {
    let bankAccountId = 0;
    if (this.bankAccounts.length > 0) {
      bankAccountId = this.bankAccounts[0].id;
    }
    let budgetId = 0;
    if (this.budgets.length > 0) {
      budgetId = this.budgets[0].id;
      //TODO: temporary adjustment to make testing easier
      budgetId = this.budgets[4].id;
    }

    this.form.setValue({ budget_id: budgetId, bank_account_id: bankAccountId});
  }

  onSubmit() {
    let output = Object.assign({}, this.form.value);
    this.updateBudgetAndBankAccount(output);
    this.change.emit(output);
  }

}
