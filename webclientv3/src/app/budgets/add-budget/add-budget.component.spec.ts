import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { TestConfigModule } from "../../../../test/test-config.module";
import { SharedModule } from "../../shared/shared.module";

import { AddBudgetComponent } from "./add-budget.component";

describe("AddBudgetComponent", () => {
  let component: AddBudgetComponent;
  let fixture: ComponentFixture<AddBudgetComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [TestConfigModule, SharedModule],
        declarations: [AddBudgetComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AddBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
