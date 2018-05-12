import {NO_ERRORS_SCHEMA} from "@angular/core";
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {TestConfigModule} from "../../../../test/test-config.module";
import {BankAccountService} from "../../bank-accounts/bank-account.service";
import {BudgetService} from "../../budgets/budget.service";
import {MainToolbarService} from "../../shared/main-toolbar/main-toolbar.service";
import {SharedModule} from "../../shared/shared.module";
import {TransactionDataService} from "../transaction-data.service";
import {TransactionListComponent} from "../transaction-list/transaction-list.component";
import {TransactionSearchParams} from "../transaction-search-form/transaction-search-params.model";
import {TransactionService} from "../transaction.service";

import {TransactionsComponent} from './transactions.component';

describe('TransactionsComponent', () => {
import { of } from "rxjs";
  let component: TransactionsComponent;
  let fixture: ComponentFixture<TransactionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule.forRoot(),
        TestConfigModule,
      ],
      declarations: [
        TransactionsComponent,
        TransactionListComponent,
      ],
      schemas: [
        NO_ERRORS_SCHEMA,
      ],
      providers: [
        TransactionDataService,
        BudgetService,
        BankAccountService,
        TransactionService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('sets up the page heading properly', () => {
    fixture.detectChanges();
    let toolbarService: MainToolbarService = TestBed.get(MainToolbarService);
    expect(toolbarService.getHeading()).toBe('Transactions');
  });

  xit('resets properly after save', () => {
    let transactionService = TestBed.get(TransactionService);
    spyOn(transactionService, "save").and.returnValue(of([]));
    fixture.detectChanges();
    component.transactionList.isEditMode = true;
    component.save();
    fixture.detectChanges();
    expect(component.transactionList.isEditMode).toBe(false);
  });

});
