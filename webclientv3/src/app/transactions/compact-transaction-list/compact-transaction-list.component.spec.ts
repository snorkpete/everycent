import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompactTransactionListComponent } from './compact-transaction-list.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';

xdescribe('TransactionListComponent', () => {
  let component: CompactTransactionListComponent;
  let fixture: ComponentFixture<CompactTransactionListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompactTransactionListComponent ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompactTransactionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
