import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { TestConfigModule } from "../../../../test/test-config.module";
import { SharedModule } from "../../shared/shared.module";
import { ReportingModule } from "../reporting.module";

import { NetWorthReportComponent } from "./net-worth-report.component";

describe("NetWorthReportComponent", () => {
  let component: NetWorthReportComponent;
  let fixture: ComponentFixture<NetWorthReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TestConfigModule, SharedModule.forRoot(), ReportingModule]
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
