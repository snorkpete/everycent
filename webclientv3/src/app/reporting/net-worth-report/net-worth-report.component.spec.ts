import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { NetWorthReportComponent } from "./net-worth-report.component";

describe("NetWorthReportComponent", () => {
  let component: NetWorthReportComponent;
  let fixture: ComponentFixture<NetWorthReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NetWorthReportComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetWorthReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
