import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {TestConfigModule} from "../../../../test/test-config.module";
import {SharedModule} from "../../shared/shared.module";
import {BudgetService} from "../budget.service";

import { FutureBudgetsComponent } from './future-budgets.component';
import {FutureBudgetsModule} from "./future-budgets.module";

describe('FutureBudgetsComponent', () => {
  let component: FutureBudgetsComponent;
  let fixture: ComponentFixture<FutureBudgetsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TestConfigModule,
        SharedModule.forRoot(),
        FutureBudgetsModule,
      ],
      providers: [
        BudgetService,
      ]
      // declarations: [ FutureBudgetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FutureBudgetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
