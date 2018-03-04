import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {TestConfigModule} from "../../../../test/test-config.module";
import {BudgetService} from "../budget.service";

import { FutureBudgetsComponent } from './future-budgets.component';
import {FutureBudgetsModule} from "./future-budgets.module";

describe('FutureBudgetsComponent', () => {
  let component: FutureBudgetsComponent;
  let fixture: ComponentFixture<FutureBudgetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TestConfigModule,
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
