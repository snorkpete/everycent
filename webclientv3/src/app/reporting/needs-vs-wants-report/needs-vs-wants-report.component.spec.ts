import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { TestConfigModule } from "../../../../test/test-config.module";
import { SharedModule } from "../../shared/shared.module";

import { NeedsVsWantsReportComponent } from "./needs-vs-wants-report.component";

describe("WantsVsNeedsReportComponent", () => {
  let component: NeedsVsWantsReportComponent;
  let fixture: ComponentFixture<NeedsVsWantsReportComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestConfigModule, SharedModule.forRoot()],
      declarations: [NeedsVsWantsReportComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NeedsVsWantsReportComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
