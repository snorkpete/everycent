import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {BudgetsModule} from "../../budgets.module";

import { AllocationListFooterComponent } from './allocation-list-footer.component';

describe('AllocationListFooterComponent', () => {
  let component: AllocationListFooterComponent;
  let fixture: ComponentFixture<AllocationListFooterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        BudgetsModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllocationListFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
