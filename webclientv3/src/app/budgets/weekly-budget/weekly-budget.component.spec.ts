import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { WeeklyBudgetComponent } from "./weekly-budget.component";

describe("WeeklyBudgetComponent", () => {
  let component: WeeklyBudgetComponent;
  let fixture: ComponentFixture<WeeklyBudgetComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [WeeklyBudgetComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeeklyBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
