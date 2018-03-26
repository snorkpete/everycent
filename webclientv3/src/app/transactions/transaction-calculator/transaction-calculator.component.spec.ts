import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionCalculatorComponent } from './transaction-calculator.component';

describe('TransactionCalculatorComponent', () => {
  let component: TransactionCalculatorComponent;
  let fixture: ComponentFixture<TransactionCalculatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionCalculatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
