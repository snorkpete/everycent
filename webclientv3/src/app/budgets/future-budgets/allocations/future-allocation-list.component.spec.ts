import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { TestConfigModule } from "../../../../../test/test-config.module";
import { SharedModule } from "../../../shared/shared.module";
import { BudgetService } from "../../budget.service";
import { FutureBudgetsDataFormatterService } from "../future-budgets-data-formatter.service";

import { FutureAllocationListComponent } from "./future-allocation-list.component";

describe("FutureAllocationListComponent", () => {
  let component: FutureAllocationListComponent;
  let fixture: ComponentFixture<FutureAllocationListComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [TestConfigModule, SharedModule.forRoot()],
        declarations: [FutureAllocationListComponent],
        providers: [BudgetService, FutureBudgetsDataFormatterService]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(FutureAllocationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
