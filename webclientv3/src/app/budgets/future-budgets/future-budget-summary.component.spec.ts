import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { TestConfigModule } from "../../../../test/test-config.module";
import { SharedModule } from "../../shared/shared.module";
import { BudgetService } from "../budget.service";

import { FutureBudgetSummaryComponent } from "./future-budget-summary.component";

describe("FutureBudgetSummaryComponent", () => {
  let component: FutureBudgetSummaryComponent;
  let fixture: ComponentFixture<FutureBudgetSummaryComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [TestConfigModule, SharedModule.forRoot()],
        declarations: [FutureBudgetSummaryComponent],
        providers: [BudgetService]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(FutureBudgetSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
