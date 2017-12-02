import { async, ComponentFixture, TestBed } from '@angular/core/testing';

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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
      ],
      declarations: [ TransactionSearchFormComponent ],
      schemas: [
        NO_ERRORS_SCHEMA,
      ],
      providers: [
        { provide: BankAccountService, useValue: BankAccountServiceStub },
        { provide: BudgetService, useValue: BudgetServiceStub },
        FormBuilder,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionSearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
