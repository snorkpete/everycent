import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {TestConfigModule} from "../../../../test/test-config.module";
import {SharedModule} from "../../shared/shared.module";

import { TransactionSummaryComponent } from './transaction-summary.component';

describe('TransactionSummaryComponent', () => {
  let component: TransactionSummaryComponent;
  let fixture: ComponentFixture<TransactionSummaryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TestConfigModule,
        SharedModule.forRoot(),
      ],
      declarations: [ TransactionSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
