import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {TestConfigModule} from "../../../../test/test-config.module";
import {BankAccountService} from "../../bank-accounts/bank-account.service";
import {SharedModule} from "../../shared/shared.module";
import {BudgetsModule} from "../budgets.module";

import { BudgetEditorComponent } from './budget-editor.component';

describe('BudgetEditorComponent', () => {
  let component: BudgetEditorComponent;
  let fixture: ComponentFixture<BudgetEditorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TestConfigModule,
        SharedModule.forRoot(),
        BudgetsModule,
      ],
      // declarations: [ BudgetEditorComponent ]
      providers: [
        BankAccountService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BudgetEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
