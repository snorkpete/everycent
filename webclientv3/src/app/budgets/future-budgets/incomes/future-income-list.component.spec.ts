import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {TestConfigModule} from "../../../../../test/test-config.module";
import {SharedModule} from "../../../shared/shared.module";
import {FutureBudgetsModule} from "../future-budgets.module";

import { FutureIncomeListComponent } from './future-income-list.component';

describe('FutureIncomeListComponent', () => {
  let component: FutureIncomeListComponent;
  let fixture: ComponentFixture<FutureIncomeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TestConfigModule, SharedModule, FutureBudgetsModule
      ],
      // declarations: [ FutureIncomeListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FutureIncomeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
