import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {TestConfigModule} from "../../../../../test/test-config.module";
import {SharedModule} from "../../../shared/shared.module";
import {FutureBudgetsModule} from "../../future-budgets/future-budgets.module";

import { AllocationListSummaryComponent } from './allocation-list-summary.component';

describe('AllocationListSummaryComponent', () => {
  let component: AllocationListSummaryComponent;
  let fixture: ComponentFixture<AllocationListSummaryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TestConfigModule, SharedModule.forRoot(),
      ],
      declarations: [ AllocationListSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllocationListSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
