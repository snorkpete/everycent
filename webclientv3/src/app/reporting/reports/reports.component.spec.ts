import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { TestConfigModule } from "../../../../test/test-config.module";
import { BudgetsModule } from "../../budgets/budgets.module";
import { SharedModule } from "../../shared/shared.module";
import { ReportingModule } from "../reporting.module";

import { ReportsComponent } from "./reports.component";

describe("ReportsComponent", () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestConfigModule, SharedModule.forRoot(), ReportingModule]
      // declarations: [ ReportsComponent ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
