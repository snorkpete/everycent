import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
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
export class TransactionSearchFormComponent implements OnInit, OnDestroy {

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

    this.loadBudgetsAndBankAccounts();

    // setup the form to monitor the URL for parameter changes
    this.activatedRoute.queryParamMap
                       .map(this.convertToNumericParams)
                       .takeUntil(this.componentDestroyed)
                       .subscribe(params => {
                         this.form.patchValue(params);
                       });

    // changes to the form are emitted as change events
    this.form.valueChanges
        .takeUntil(this.componentDestroyed)
        .subscribe(() => {
          this.onSubmit();
        });
  }

  private convertToNumericParams(params: ParamMap): TransactionSearchParams {
    let budget_id = parseInt(params.get('budget_id'), 10) || 0;
    let bank_account_id = parseInt(params.get('bank_account_id'), 10) || 0;

    return {
      budget_id,
      bank_account_id,
    };
  }

  updateBudgetAndBankAccount(searchParams: TransactionSearchParams) {
    let validBankAccount = this.bankAccounts.find(account => account.id === searchParams.bank_account_id);
    if (validBankAccount) {
      searchParams.bankAccount = validBankAccount;
    }
    let validBudget = this.budgets.find(account => account.id === searchParams.budget_id);
    if (validBudget) {
      searchParams.budget = validBudget;
    }
  }

  loadBudgetsAndBankAccounts() {
    Observable.combineLatest(
      this.bankAccountService.getBankAccounts(),
      this.budgetService.getBudgets(),
      this.activatedRoute.queryParamMap.map(this.convertToNumericParams).take(1)
    ).subscribe((results) => {
      let initialParams;
      [this.bankAccounts, this.budgets, initialParams] = results;
      this.setInitialFormValue(initialParams);
    });

  }

  setInitialFormValue(initialParams: TransactionSearchParams) {
    let properParams = this.initializeWithDefaultValuesIfNeeded(initialParams);
    this.form.patchValue(properParams);
    this.onSubmit();
  }

  initializeWithDefaultValuesIfNeeded(externalParams: TransactionSearchParams): TransactionSearchParams {
    let bank_account_id = externalParams.bank_account_id || this.firstBankAccountId();
    let budget_id = externalParams.budget_id || this.firstBudgetId();
    return {
      bank_account_id,
      budget_id,
    };
  }

  firstBudgetId() {
    return this.budgets.length > 0 ? this.budgets[0].id : 0;
  }

  firstBankAccountId() {
    return this.bankAccounts.length > 0 ? this.bankAccounts[0].id : 0;
  }

  onSubmit() {
    let output = Object.assign({}, this.form.value);
    this.updateBudgetAndBankAccount(output);
    this.change.emit(output);
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }
}
