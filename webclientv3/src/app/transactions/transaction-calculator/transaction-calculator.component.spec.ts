import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {TestConfigModule} from "../../../../test/test-config.module";
import {SharedModule} from "../../shared/shared.module";

import { TransactionCalculatorComponent } from './transaction-calculator.component';

describe('TransactionCalculatorComponent', () => {
  let component: TransactionCalculatorComponent;
  let fixture: ComponentFixture<TransactionCalculatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TestConfigModule,
        SharedModule,
      ],
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
