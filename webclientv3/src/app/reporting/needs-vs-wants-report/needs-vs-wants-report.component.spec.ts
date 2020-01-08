import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { NeedsVsWantsReportComponent } from "./needs-vs-wants-report.component";

describe("WantsVsNeedsReportComponent", () => {
  let component: NeedsVsWantsReportComponent;
  let fixture: ComponentFixture<NeedsVsWantsReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NeedsVsWantsReportComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NeedsVsWantsReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
