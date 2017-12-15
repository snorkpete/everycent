import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ActivatedRoute, ParamMap} from "@angular/router";
import {Subject} from "rxjs/Subject";
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

  private componentDestroyed = new Subject();

  constructor(
    private bankAccountService: BankAccountService,
    private budgetService: BudgetService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      budget_id: 0,
      bank_account_id: 0
    });

    this.activatedRoute.queryParamMap.subscribe(params => {
      let searchParams = {
        budget_id: parseInt(params.get('budget_id'), 10),
        bank_account_id: parseInt(params.get('bank_account_id'), 10),
      };
      this.form.patchValue(searchParams);
    });

    this.loadBudgetsAndBankAccounts();

    this.form.valueChanges.subscribe(v => {
      this.updateBudgetAndBankAccount(v);
      this.change.emit(v);
    });
  }

  updateBudgetAndBankAccount(searchParams: TransactionSearchParams) {
    if (!searchParams.bankAccount) {
      searchParams.bankAccount = this.bankAccounts.find(account => account.id === searchParams.bank_account_id);
    }

    if (!searchParams.budget) {
      searchParams.budget = this.budgets.find(account => account.id === searchParams.budget_id);
    }
  }

  loadBudgetsAndBankAccounts() {
    Observable.combineLatest(
      this.bankAccountService.getBankAccounts(),
      this.budgetService.getBudgets(),
      this.activatedRoute.queryParamMap.take(1)
    ).subscribe((results) => {
      let initialParams: ParamMap;
      [this.bankAccounts, this.budgets, initialParams] = results;
      this.setInitialValues({
        budget_id: parseInt(initialParams.get('budget_id'), 10),
        bank_account_id: parseInt(initialParams.get('bank_account_id'), 10)
      });
    });

  }

  setInitialValues(initialParams: TransactionSearchParams) {
    let bankAccountId = this.bankAccounts[0] && this.bankAccounts[0].id;
    if (this.bankAccounts.find(account => account.id === initialParams.bank_account_id)) {
      bankAccountId = initialParams.bank_account_id;
    }
    let budgetId = this.budgets[0] && this.budgets[0].id;
    if (this.budgets.find(budget => budget.id === initialParams.budget_id)) {
      budgetId = initialParams.budget_id;
    }

    this.form.patchValue({ budget_id: budgetId, bank_account_id: bankAccountId});
    this.onSubmit();
  }

  onSubmit() {
    let output = Object.assign({}, this.form.value);
    this.updateBudgetAndBankAccount(output);
    this.change.emit(output);
  }

}
