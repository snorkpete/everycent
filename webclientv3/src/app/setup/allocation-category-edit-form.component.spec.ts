import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { TestConfigModule } from "../../../test/test-config.module";
import { SharedModule } from "../shared/shared.module";
import { AllocationCategoryEditFormComponent } from "./allocation-category-edit-form.component";

describe("AccountCategoryEditFormComponent", () => {
  let component: AllocationCategoryEditFormComponent;
  let fixture: ComponentFixture<AllocationCategoryEditFormComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [TestConfigModule, SharedModule.forRoot()],
        declarations: [AllocationCategoryEditFormComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AllocationCategoryEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
