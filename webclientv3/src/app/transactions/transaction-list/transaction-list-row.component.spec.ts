import {CommonModule} from "@angular/common";
import {DebugElement, NO_ERRORS_SCHEMA} from "@angular/core";
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {By} from "@angular/platform-browser";
import {SampleTransactionData} from "../../../../test/samples/sample-transaction-data";
import {TestConfigModule} from "../../../../test/test-config.module";
import {SharedModule} from "../../shared/shared.module";
import {TransactionDateValidatorDirective} from "../transaction-date-validator.directive";

import { TransactionListRowComponent } from './transaction-list-row.component';
import {TransactionData} from "../transaction-data.model";

describe('TransactionListRowComponent', () => {
  let component: TransactionListRowComponent;
  let fixture: ComponentFixture<TransactionListRowComponent>;
  let transaction = SampleTransactionData;
  let de: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        TestConfigModule,
      ],
      declarations: [
        TransactionDateValidatorDirective,
        TransactionListRowComponent,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionListRowComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    component.transaction = transaction;
    fixture.detectChanges();
  });

  it('should create transaction list row', () => {
    expect(component).toBeTruthy();
  });

  describe('fields', () => {

    it('contains a checkbox field for selecting transactions', () => {

    });

    it('contains a transaction date field', () => {
      let element = de.nativeElement.querySelector('td:nth-child(2)');
      expect(element.innerHTML).toContain(transaction.transaction_date);
    });

    it('contains a description field', () => {
      let element = de.nativeElement.querySelector('td:nth-child(3)');
      expect(element.innerHTML).toContain(transaction.description);
    });

    it ('contains an allocation field that shows sink fund or normal allocations', () => {
      let element = de.nativeElement.querySelector('td:nth-child(4)');
      expect(element.innerHTML).toContain(transaction.allocation_id);
    });

    it('contains a withdrawal amount field', () => {
      let element = de.nativeElement.querySelector('td:nth-child(5)');
      expect(element.innerHTML).toContain(transaction.withdrawal_amount);

    });

    it('contains a deposit amount field', () => {
      let element = de.nativeElement.querySelector('td:nth-child(6)');
      expect(element.innerHTML).toContain(transaction.deposit_amount);

    });

    it('contains a status field that shows Yes or No based on the paid status', () => {
      let element = de.nativeElement.querySelector('td:nth-child(7)'); /*? transaction.status */
      expect(element.innerHTML).toContain('paid');

    });

    it('contains a delete button', () => {

    });
  });

  it('highlights deleted items with .deleted class', () => {

  });

  it('highlights paid items with .paid class', () => {

  });

  it('highlights items that are outside the budget range with .outside-budget-range class', () => {

  });

  it("has a checkbox that changes the transaction's selected property when toggled", () => {

  });

  it("has a checkbox that changes the transaction's paid property when toggled", () => {

  });

  it("updates the transactions status to 'paid' if the transaction.paid value is true", () => {

  });

  it("updates the transactions status to 'paid' if the transaction.paid value is false", () => {

  });
});
