import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {FormBuilder} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs/Observable";
import {ActivatedRouteStub} from "../../../../test/stub-services/activated-route-stub";
import {TestConfigModule} from "../../../../test/test-config.module";
import {BankAccountData} from "../../bank-accounts/bank-account.model";
import {BankAccountService} from "../../bank-accounts/bank-account.service";
import {BudgetData} from "../../budgets/budget.model";
import {BudgetService} from "../../budgets/budget.service";
import {SharedModule} from "../../shared/shared.module";

import {TransactionSearchFormComponent} from './transaction-search-form.component';

const BankAccountServiceStub = {
  getBankAccounts: () => Observable.of([])
};

const BudgetServiceStub = {
  getBudgets: () => Observable.of([])
};

describe('TransactionsSearchFormComponent', () => {
  let component: TransactionSearchFormComponent;
  let fixture: ComponentFixture<TransactionSearchFormComponent>;
  let route: ActivatedRouteStub;
  let bankAccountService: BankAccountService;
  let budgetService: BudgetService;

  let sampleBankAccounts: BankAccountData[];
  let sampleBudgets: BudgetData[];

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

  beforeEach(() => {
    sampleBankAccounts = [
      { id: 5, name: 'First Account' },
      { id: 3, name: 'Second Account' },
      { id: 2, name: 'Third Account' },
    ];
    sampleBudgets = [
      { id: 15, name: 'First Budget' },
      { id: 13, name: 'Second Budget' },
      { id: 4, name: 'Third Budget' },
    ];
    spyOn(bankAccountService, 'getBankAccounts').and.returnValue(Observable.of(sampleBankAccounts));
    spyOn(budgetService, 'getBudgets').and.returnValue(Observable.of(sampleBudgets));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when initializing', () => {

    beforeEach(() => {
    });

    it('sets up the list of bankAccounts', () => {
      fixture.detectChanges();
      expect(component.bankAccounts).toEqual(sampleBankAccounts);
    });

    it('sets up the list of budgets', () => {
      fixture.detectChanges();
      expect(component.budgets).toEqual(sampleBudgets);
    });

    it('emits the first budget and bank account after init when no router params', () => {
      let firstBankAccount = sampleBankAccounts[0];
      let firstBudget = sampleBudgets[0];
      route.testQueryParamMap = {};

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

  describe('when has valid router params', () => {
    it('emits the value of the budget id & bank_account_id', () => {
      let secondBankAccount = sampleBankAccounts[1];
      let secondBudget = sampleBudgets[1];
      route.testQueryParamMap = {bank_account_id: secondBankAccount.id, budget_id: secondBudget.id};
      let changeEmitCount = 0;
      component.change.subscribe(searchParams => {
        changeEmitCount += 1;
        expect(searchParams).toEqual({
          bank_account_id: secondBankAccount.id,
          budget_id: secondBudget.id,
          bankAccount: secondBankAccount,
          budget: secondBudget,
        });
      });
      fixture.detectChanges();
      expect(changeEmitCount).toEqual(1);
    });
  });

  describe('when has invalid params', () => {
    it('emits an object without bankAccount and budget set', () => {
      route.testQueryParamMap = {bank_account_id: 40, budget_id: 100};

      let changeEmitCount = 0;
      component.change.subscribe(searchParams => {
        changeEmitCount += 1;
        expect(searchParams).toEqual({ bank_account_id: 40, budget_id: 100 });
      });

      fixture.detectChanges();
      expect(changeEmitCount).toEqual(1);
    });
  });

  describe('on form change', () => {
    it('emits a new change event', () => {

      // allow ngInit to run
      fixture.detectChanges();

      let thirdAccount = sampleBankAccounts[2];
      let thirdBudget = sampleBudgets[2];

      let changeEmitCount = 0;
      component.change.subscribe(searchParams => {
        changeEmitCount += 1;
        expect(searchParams).toEqual({
          bank_account_id: thirdAccount.id,
          budget_id: thirdBudget.id,
          bankAccount: thirdAccount,
          budget: thirdBudget,
        });
      });
      component.form.setValue({budget_id: thirdBudget.id, bank_account_id: thirdAccount.id});
      fixture.detectChanges();
      expect(changeEmitCount).toEqual(1);
    });
  });


});
