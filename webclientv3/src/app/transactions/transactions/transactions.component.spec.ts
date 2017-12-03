import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionsComponent } from './transactions.component';
import { TransactionListComponent } from '../transaction-list/transaction-list.component';
import {SharedModule} from "../../shared/shared.module";
import {TransactionSummaryComponent} from "../transaction-summary/transaction-summary.component";
import {TransactionSearchFormComponent} from "../transaction-search-form/transaction-search-form.component";
import {TransactionService} from "../transaction.service";
import {Observable} from "rxjs/Observable";
import {NO_ERRORS_SCHEMA} from "@angular/core";
import {TestConfigModule} from "../../../../test/test-config.module";

describe('TransactionsComponent', () => {
  let component: TransactionsComponent;
  let fixture: ComponentFixture<TransactionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        TestConfigModule,
      ],
      declarations: [
        TransactionsComponent,
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
