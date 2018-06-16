import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { TestConfigModule } from "../../../test/test-config.module";
import { SharedModule } from "../shared/shared.module";

import { AllocationCategoriesComponent } from "./allocation-categories.component";

describe("AllocationCategoriesComponent", () => {
  let component: AllocationCategoriesComponent;
  let fixture: ComponentFixture<AllocationCategoriesComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [TestConfigModule, SharedModule.forRoot()],
        declarations: [AllocationCategoriesComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AllocationCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
