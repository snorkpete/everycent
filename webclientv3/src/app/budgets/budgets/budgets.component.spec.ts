import { DebugElement } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { TestConfigModule } from "../../../../test/test-config.module";
import { SharedModule } from "../../shared/shared.module";
import { BudgetsModule } from "../budgets.module";

import { BudgetsComponent } from "./budgets.component";

describe("BudgetsComponent", () => {
  let component: BudgetsComponent;
  let fixture: ComponentFixture<BudgetsComponent>;
  let de: DebugElement;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [TestConfigModule, BudgetsModule, SharedModule.forRoot()]
      });
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(BudgetsComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
