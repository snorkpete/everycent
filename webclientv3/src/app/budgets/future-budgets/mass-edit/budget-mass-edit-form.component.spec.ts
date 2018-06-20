import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { TestConfigModule } from "../../../../../test/test-config.module";
import { SharedModule } from "../../../shared/shared.module";

import { BudgetMassEditFormComponent } from "./budget-mass-edit-form.component";

describe("BudgetMassEditFormComponent", () => {
  let component: BudgetMassEditFormComponent;
  let fixture: ComponentFixture<BudgetMassEditFormComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [TestConfigModule, SharedModule.forRoot()],
        declarations: [BudgetMassEditFormComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(BudgetMassEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
