import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionSearchFormComponent } from './transaction-search-form.component';

describe('TransactionsSearchFormComponent', () => {
  let component: TransactionSearchFormComponent;
  let fixture: ComponentFixture<TransactionSearchFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionSearchFormComponent ]
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
