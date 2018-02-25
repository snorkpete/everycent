import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {TestConfigModule} from "../../../../test/test-config.module";
import {BankAccountService} from "../../bank-accounts/bank-account.service";
import {SharedModule} from "../../shared/shared.module";
import {BudgetsModule} from "../budgets.module";

import { BudgetComponent } from './budget.component';

describe('BudgetComponent', () => {
  let component: BudgetComponent;
  let fixture: ComponentFixture<BudgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TestConfigModule,
        SharedModule.forRoot(),
        BudgetsModule,
      ],
      // declarations: [ BudgetComponent ],
      providers: [
        BankAccountService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
