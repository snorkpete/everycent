import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { TestConfigModule } from "../../../test/test-config.module";
import { SharedModule } from "../shared/shared.module";

import { InstitutionEditFormComponent } from "./institution-edit-form.component";

describe("InstitutionEditFormComponent", () => {
  let component: InstitutionEditFormComponent;
  let fixture: ComponentFixture<InstitutionEditFormComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [TestConfigModule, SharedModule],
        declarations: [InstitutionEditFormComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(InstitutionEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
