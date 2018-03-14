import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FutureBudgetSummaryComponent } from './future-budget-summary.component';

describe('FutureBudgetSummaryComponent', () => {
  let component: FutureBudgetSummaryComponent;
  let fixture: ComponentFixture<FutureBudgetSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FutureBudgetSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FutureBudgetSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
