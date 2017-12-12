import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionListHeaderComponent } from './transaction-list-header.component';
import {By} from "@angular/platform-browser";
import {DebugElement} from "@angular/core";

describe('TransactionHeaderComponent', () => {
  let component: TransactionListHeaderComponent;
  let fixture: ComponentFixture<TransactionListHeaderComponent>;
  let de: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionListHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionListHeaderComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows Sink Fund Allocation column if bankAccount is a sink fund', () => {
    let sinkFund = { is_sink_fund: true };
    component.bankAccount = sinkFund;
    fixture.detectChanges();
    let allocationHeader = de.nativeElement.querySelector('.allocation-header');
    expect(allocationHeader.textContent).toContain('Sink Fund Allocation');
  });

  it('shows Allocation if bankAccount is not a sink fund', () => {
    let sinkFund = { is_sink_fund: false };
    component.bankAccount = sinkFund;
    fixture.detectChanges();
    let allocationHeader = de.nativeElement.querySelector('.allocation-header');
    expect(allocationHeader.textContent).toContain('Allocation');

  });
});
