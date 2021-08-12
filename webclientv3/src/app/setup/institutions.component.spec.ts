import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { TestConfigModule } from "../../../test/test-config.module";
import { SharedModule } from "../shared/shared.module";

import { InstitutionsComponent } from "./institutions.component";

describe("InstitutionsComponent", () => {
  let component: InstitutionsComponent;
  let fixture: ComponentFixture<InstitutionsComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [TestConfigModule, SharedModule.forRoot()],
        declarations: [InstitutionsComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(InstitutionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
