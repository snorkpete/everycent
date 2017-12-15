import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {ActivatedRoute} from "@angular/router";
import {ActivatedRouteStub} from "../../../../test/stub-services/activated-route-stub";
import {TestConfigModule} from "../../../../test/test-config.module";
import {BankAccountData} from "../../bank-accounts/bank-account.model";
import {BudgetData} from "../../budgets/budget.model";

import { TransactionSearchFormComponent } from './transaction-search-form.component';
import {SharedModule} from "../../shared/shared.module";
import {BankAccountService} from "../../bank-accounts/bank-account.service";
import {BudgetService} from "../../budgets/budget.service";
import {Observable} from "rxjs/Observable";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {NO_ERRORS_SCHEMA} from "@angular/core";
import {FormBuilder} from "@angular/forms";

const BankAccountServiceStub = {
  getBankAccounts: () => Observable.of([])
}

const BudgetServiceStub = {
  getBudgets: () => Observable.of([])
}

describe('TransactionsSearchFormComponent', () => {
  let component: TransactionSearchFormComponent;
  let fixture: ComponentFixture<TransactionSearchFormComponent>;
  let route: ActivatedRouteStub;
  let bankAccountService: BankAccountService;
  let budgetService: BudgetService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TestConfigModule,
        SharedModule
      ],
      declarations: [ TransactionSearchFormComponent ],
      schemas: [
      ],
      providers: [
        { provide: BankAccountService, useValue: BankAccountServiceStub },
        { provide: BudgetService, useValue: BudgetServiceStub },
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
        FormBuilder,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionSearchFormComponent);
    component = fixture.componentInstance;
    route = TestBed.get(ActivatedRoute);
    bankAccountService = TestBed.get(BankAccountService);
    budgetService = TestBed.get(BudgetService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when initializing', () => {

    let sampleBankAccounts: BankAccountData[];
    let sampleBudgets: BudgetData[];

    beforeEach(() => {
      sampleBankAccounts = [
        { id: 5, name: 'First Account' },
        { id: 3, name: 'Second Account' },
      ];
      sampleBudgets = [
        { id: 15, name: 'First Budget' },
        { id: 13, name: 'Second Budget' },
      ];
      spyOn(bankAccountService, 'getBankAccounts').and.returnValue(Observable.of(sampleBankAccounts));
      spyOn(budgetService, 'getBudgets').and.returnValue(Observable.of(sampleBudgets));
    });

    it('sets up the list of bankAccounts', () => {
      fixture.detectChanges();
      expect(component.bankAccounts).toEqual(sampleBankAccounts);
    });

    it('sets up the list of budgets', () => {
      fixture.detectChanges();
      expect(component.budgets).toEqual(sampleBudgets);
    });

    it('emits the first budget and bank account after init', () => {
      let firstBankAccount = sampleBankAccounts[0];
      let firstBudget = sampleBudgets[0];

      let changeEmitCount = 0;
      component.change.subscribe(searchParams => {
        changeEmitCount += 1;
        expect(searchParams).toEqual({
          bank_account_id: firstBankAccount.id,
          budget_id: firstBudget.id,
          bankAccount: firstBankAccount,
          budget: firstBudget,
        });
      });
      fixture.detectChanges();
      expect(changeEmitCount).toEqual(1);
    });

  });

  describe('when no router params', () => {
    it('emits the value of the first budget id & first bank_account_id', () => {

    })
  });

  describe('when has valid params', () => {
    it('emits the value of the budget id & bank_account_id', () => {

    })
  });

  describe('when has invalid params', () => {
    it('emits an empty object', () => {

    })
  });


});
