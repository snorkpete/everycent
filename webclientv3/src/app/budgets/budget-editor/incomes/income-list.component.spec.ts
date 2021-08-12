import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {TestConfigModule} from "../../../../../test/test-config.module";
import {BankAccountService} from "../../../bank-accounts/bank-account.service";
import {BudgetsModule} from "../../budgets.module";

import { IncomeListComponent } from './income-list.component';

describe('IncomeListComponent', () => {
  let component: IncomeListComponent;
  let fixture: ComponentFixture<IncomeListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TestConfigModule,
        BudgetsModule,
      ],
      // declarations: [ IncomeListComponent ]
      providers: [
        BankAccountService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
